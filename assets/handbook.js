/* Inspectable HL7 fields — hover, focus or tap a token in a sample message to
   see its name, its parsed components and the DICOM attribute it maps to. */
(function(){
  var tip = document.getElementById('ftip');
  if (!tip) return;

  var MAP = {
    'MSH-2':  {name:'Encoding Characters', note:'Component, repetition, escape and subcomponent separators, in that order. The field separator itself is MSH-1 — the fourth character of the message. Counting MSH fields off by one from here is the most common mapping error in the industry.'},
    'PID-1':  {name:'Set ID — PID', note:'Sequence number for repeated PID segments. 1 for the first occurrence.'},
    'PV1-1':  {name:'Set ID — PV1', note:'Sequence number for repeated PV1 segments.'},
    'OBR-1':  {name:'Set ID — OBR', note:'Sequence number within the order group. Increments when one message carries several orders.'},
    'MSH-3':  {name:'Sending Application', note:'Which system emitted the message. Routing and audit both key on this — it is how you prove where a bad value entered the chain.'},
    'MSH-4':  {name:'Sending Facility'},
    'MSH-5':  {name:'Receiving Application'},
    'MSH-6':  {name:'Receiving Facility'},
    'MSH-7':  {name:'Date/Time of Message', note:'When the sender built the message — not when the exam happens. No timezone offset here means the receiver applies its own locale.'},
    'MSH-9':  {name:'Message Type', comp:['Message code','Trigger event','Message structure'],
               note:'The third component is absent in 2.3.1 messages. Populating it lets the receiver pick a parser without inferring one from the trigger.'},
    'MSH-10': {name:'Message Control ID', note:'Echoed back in MSA-2 of the acknowledgement. This is the string you grep for when tracing one message through five systems.'},
    'MSH-11': {name:'Processing ID', note:'P production · D debugging · T training. A test message with <b>P</b> here is how test patients reach production PACS.'},
    'MSH-12': {name:'Version ID', note:'ORM^O01 is a 2.3-era message. HL7 2.5.1 deprecates it in favour of OMI^O23.'},

    'PID-3':  {name:'Patient Identifier List', dicom:'(0010,0020) Patient ID',
               comp:['ID number','Check digit','Check-digit scheme','Assigning authority','Identifier type code'],
               note:'<b>Key 1 of 3.</b> Joins images to the person. DICOM has no field for the assigning authority, so component 4 is normally dropped on the way in — which is why two facilities feeding one PACS can collide on the same MRN.'},
    'PID-5':  {name:'Patient Name', dicom:'(0010,0010) Patient’s Name',
               comp:['Family name','Given name','Middle name','Suffix','Prefix','Degree','Name type code'],
               note:'Both sides use ^, but the component order differs: HL7 XPN is Family^Given^Middle^Suffix^Prefix, DICOM PN is Family^Given^Middle^<b>Prefix^Suffix</b>. Swapping 4 and 5 is a classic interface bug.'},
    'PID-7':  {name:'Date/Time of Birth', dicom:'(0010,0030) Patient’s Birth Date',
               note:'HL7 YYYYMMDD maps straight to the DICOM DA value representation. Any time portion has to be truncated.'},
    'PID-8':  {name:'Administrative Sex', dicom:'(0010,0040) Patient’s Sex',
               note:'HL7 table 0001 allows F, M, O, U, A and N. DICOM accepts only <b>M, F and O</b> — everything else must be mapped or blanked, not passed through.'},

    'PV1-2':  {name:'Patient Class', note:'I inpatient · O outpatient · E emergency · P preadmit · R recurring. Drives which worklist and which retention rule the study lands under.'},
    'PV1-3':  {name:'Assigned Patient Location', comp:['Point of care','Room','Bed','Facility','Location status','Person location type','Building','Floor']},
    'PV1-7':  {name:'Attending Doctor', comp:['ID number','Family name','Given name','Middle name','Suffix','Prefix','Degree']},
    'PV1-8':  {name:'Referring Doctor', dicom:'(0008,0090) Referring Physician’s Name',
               comp:['ID number','Family name','Given name','Middle name','Suffix','Prefix','Degree'],
               note:'Watch the split: the <em>referring</em> physician goes to (0008,0090), while the <em>requesting</em> physician comes from ORC-12 and goes to (0032,1032). Sites routinely wire both from the same field and then cannot tell them apart.'},

    'ORC-1':  {name:'Order Control', note:'<b>The verb of the message.</b> SC means status changed — update the existing worklist entry in place. A receiver that treats SC as NW creates a duplicate entry, and a technologist eventually scans against the wrong one.'},
    'ORC-2':  {name:'Placer Order Number', dicom:'(0040,2016) Placer Order Number / Imaging Service Request',
               comp:['Entity identifier','Namespace ID','Universal ID','Universal ID type'],
               note:'Assigned by the system that placed the order (CPOE).'},
    'ORC-3':  {name:'Filler Order Number', dicom:'(0040,2017) Filler Order Number / Imaging Service Request',
               comp:['Entity identifier','Namespace ID','Universal ID','Universal ID type'],
               note:'Assigned by the RIS. <b>Some vendors put the accession number here</b> rather than in OBR-18 — always confirm which one your interface actually uses.'},
    'ORC-5':  {name:'Order Status', note:'SC scheduled · IP in progress · CM complete · CA cancelled · DC discontinued. Reports state; ORC-1 requests action.'},
    'ORC-7':  {name:'Quantity/Timing', comp:['Quantity','Interval','Duration','Start date/time','End date/time','Priority','Condition'],
               note:'Component 4 carries the scheduled start, component 6 the priority (S STAT · A ASAP · R routine · P preop · C callback). Deprecated from 2.5 in favour of TQ1/TQ2.'},
    'ORC-9':  {name:'Date/Time of Transaction', note:'When this order event occurred — not when the exam is scheduled.'},
    'ORC-12': {name:'Ordering Provider', dicom:'(0032,1032) Requesting Physician',
               comp:['ID number','Family name','Given name','Middle name','Suffix','Prefix','Degree'],
               note:'The requesting physician, distinct from the referring physician in PV1-8 → (0008,0090).'},
    'ORC-13': {name:'Enterer’s Location', comp:['Point of care','Room','Bed','Facility'],
               note:'Often the only clue to which department actually raised the order.'},

    'OBR-4':  {name:'Universal Service Identifier',
               dicom:'(0032,1060) Requested Procedure Description · (0040,0007) Scheduled Procedure Step Description · (0032,1064) Requested Procedure Code Sequence',
               comp:['Identifier','Text','Name of coding system','Alternate identifier','Alternate text','Alternate coding system'],
               note:'<b>The procedure code.</b> Drives hanging protocols, body-part mapping and prefetch rules. Component 3 names the coding system — C4 is CPT-4, or a local scheme. Data type is CE in 2.5.1, not CWE.'},
    'OBR-7':  {name:'Observation Date/Time', dicom:'(0040,0002) Scheduled Procedure Step Start Date · (0040,0003) …Start Time',
               note:'Becomes the scheduled step start when OBR-27 and OBR-36 are both absent.'},
    'OBR-13': {name:'Relevant Clinical Information', dicom:'(0040,1002) Reason for the Requested Procedure',
               note:'The indication. Radiologists genuinely read this off the worklist, and it is the field most often dropped in translation.'},
    'OBR-16': {name:'Ordering Provider', dicom:'(0032,1032) Requesting Physician',
               comp:['ID number','Family name','Given name','Middle name','Suffix','Prefix','Degree'],
               note:'Duplicates ORC-12. When they disagree, most receivers take ORC-12 — but not all.'},
    'OBR-18': {name:'Placer Field 1', dicom:'(0008,0050) Accession Number',
               note:'<b>Key 2 of 3.</b> Joins the images to the order and to the report. Mapping the accession here is an <em>IHE Radiology convention, not an HL7 rule</em> — some sites use OBR-2, OBR-3 or ORC-3 instead. Break it and the study arrives but never matches its report.'},
    'OBR-19': {name:'Placer Field 2', dicom:'(0040,1001) Requested Procedure ID',
               note:'Frequently, though not universally, the requested procedure ID.'},
    'OBR-24': {name:'Diagnostic Service Section ID', dicom:'(0008,0060) Modality',
               note:'Usually needs translation rather than a straight copy: HL7 uses RAD, NUC and RUS where DICOM expects CR/DX, NM and US.'},
    'OBR-25': {name:'Result Status',
               note:'On an order this is still SC. Table 0123 values are O, I, S, A, P, C, R, F, X, Y and Z — <b>M, N, U and W belong to OBX-11 (table 0085)</b> and are not valid here.'},
    'OBR-27': {name:'Quantity/Timing',
               dicom:'(0040,0002) SPS Start Date · (0040,0003) SPS Start Time · (0040,1003) Requested Procedure Priority',
               comp:['Quantity','Interval','Duration','Start date/time','End date/time','Priority','Condition'],
               note:'Component 4 is the scheduled start, component 6 the priority. This is where the worklist gets its time slot.'},
    'OBR-30': {name:'Transportation Mode', note:'WALK · PORT · CART. Drives portable workflow and room assignment.'},
    'OBR-31': {name:'Reason for Study', dicom:'(0040,1002) Reason for the Requested Procedure',
               comp:['Identifier','Text','Name of coding system'],
               note:'The coded indication, as opposed to the free text in OBR-13. Feeds decision support and appropriateness reporting.'},
    'OBR-36': {name:'Scheduled Date/Time', dicom:'(0040,0002) Scheduled Procedure Step Start Date',
               note:'Where some RIS put the schedule instead of OBR-27. Check which one your RIS populates before mapping either.'},

    'ZDS-1':  {name:'Study Instance UID', dicom:'(0020,000D) Study Instance UID',
               comp:['Pointer (the UID)','Application ID','Type of data','Subtype'],
               note:'<b>Key 3 of 3.</b> A non-standard Z-segment blessed by IHE Radiology so the RIS can mint the Study UID before acquisition. Its data type is <b>RP</b>, so the UID sits in component 1 and the rest is boilerplate. IHE defines exactly one field — anything in ZDS-2 onward is site-local. DICOM limits the UID to 64 characters, digits and dots only.'},

    'IPC-1':  {name:'Accession Identifier', dicom:'(0008,0050) Accession Number',
               note:'A defined standard field. No more accession-by-convention in OBR-18.'},
    'IPC-2':  {name:'Requested Procedure ID', dicom:'(0040,1001) Requested Procedure ID'},
    'IPC-3':  {name:'Study Instance UID', dicom:'(0020,000D) Study Instance UID',
               note:'The whole reason to prefer OMI: the Study UID has a real home, so the ZDS z-segment disappears.'},
    'IPC-4':  {name:'Scheduled Procedure Step ID', dicom:'(0040,0009) Scheduled Procedure Step ID'},
    'IPC-5':  {name:'Modality', dicom:'(0008,0060) Modality'},
    'IPC-6':  {name:'Protocol Code', dicom:'(0040,0008) Scheduled Protocol Code Sequence',
               comp:['Identifier','Text','Name of coding system'],
               note:'Repeating field. Note this is the <b>protocol code</b> — diagrams that label IPC-6 as the station AE title are wrong; that is IPC-9.'},
    'IPC-7':  {name:'Scheduled Station Name', dicom:'(0040,0010) Scheduled Station Name'},
    'IPC-8':  {name:'Scheduled Procedure Step Location', dicom:'(0040,0011) Scheduled Procedure Step Location',
               comp:['Point of care','Room','Bed','Facility']},
    'IPC-9':  {name:'Scheduled Station AE Title', dicom:'(0040,0001) Scheduled Station AE Title',
               note:'The AE title the modality matches its worklist query against.'}
  };

  function esc(s){
    return String(s).replace(/[&<>]/g, function(c){
      return c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;';
    });
  }

  function build(loc, value){
    var d = MAP[loc] || {};
    var h = '<div class="t-head"><span class="t-loc">' + esc(loc) + '</span>' +
            '<span class="t-name">' + esc(d.name || 'Field') + '</span></div><div class="t-body">';

    h += '<div class="t-lab">Value</div><div class="t-val">' + esc(value) + '</div>';

    h += '<div class="t-sec"><div class="t-lab">Maps to</div>';
    h += d.dicom
      ? '<div class="t-to">→ ' + esc(d.dicom) + '</div>'
      : '<div class="t-none">No direct DICOM attribute — workflow or routing only.</div>';
    h += '</div>';

    if (d.comp && value.indexOf('^') > -1) {
      var parts = value.split('^');
      var n = Math.min(Math.max(parts.length, d.comp.length), 9);
      h += '<div class="t-sec"><div class="t-lab">Components</div><ol class="t-comp">';
      for (var i = 0; i < n; i++) {
        var v = parts[i] || '';
        h += '<li><span class="n">.' + (i + 1) + '</span><span>' +
             (v ? '<span class="cv">' + esc(v) + '</span>' : '<span class="mt">empty</span>') +
             ' <span class="cn">' + esc(d.comp[i] || 'unused') + '</span></span></li>';
      }
      h += '</ol></div>';
    }

    if (d.note) h += '<div class="t-note">' + d.note + '</div>';
    return h + '</div>';
  }

  var current = null, pinned = null;

  function place(el){
    var r = el.getBoundingClientRect();
    tip.style.left = '0px';
    tip.style.top = '0px';
    var t = tip.getBoundingClientRect();
    var pad = 10;
    var left = Math.max(pad, Math.min(r.left + r.width / 2 - t.width / 2,
                                      window.innerWidth - t.width - pad));
    var top = r.bottom + 8;
    if (top + t.height > window.innerHeight - pad) {
      var above = r.top - t.height - 8;
      top = above >= pad ? above : Math.max(pad, window.innerHeight - t.height - pad);
    }
    tip.style.left = Math.round(left) + 'px';
    tip.style.top = Math.round(top) + 'px';
  }

  function show(el){
    if (current && current !== el) current.classList.remove('on');
    tip.innerHTML = build(el.getAttribute('data-loc'), el.textContent);
    tip.setAttribute('data-show', '');
    tip.setAttribute('aria-hidden', 'false');
    current = el;
    el.classList.add('on');
    place(el);
  }

  function hide(){
    tip.removeAttribute('data-show');
    tip.setAttribute('aria-hidden', 'true');
    if (current) { current.classList.remove('on'); current = null; }
  }

  function field(e){
    var n = e.target;
    return n && n.closest ? n.closest('.msg pre .f') : null;
  }

  document.addEventListener('mouseover', function(e){
    var el = field(e);
    if (el && !pinned) show(el);
  });
  document.addEventListener('mouseout', function(e){
    if (field(e) && !pinned) hide();
  });
  document.addEventListener('focusin', function(e){
    var el = field(e);
    if (el) { pinned = null; show(el); }
  });
  document.addEventListener('focusout', function(e){
    if (field(e) && !pinned) hide();
  });
  document.addEventListener('click', function(e){
    var el = field(e);
    if (el) {
      if (pinned === el) { pinned = null; hide(); }
      else { pinned = el; show(el); }
    } else if (pinned) {
      pinned = null;
      hide();
    }
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && current) {
      var el = current;
      pinned = null;
      hide();
      if (el.blur) el.blur();
    }
  });
  window.addEventListener('scroll', function(){ if (current) place(current); }, true);
  window.addEventListener('resize', hide);
})();

(function(){
  var links = Array.prototype.slice.call(document.querySelectorAll('#sidenav a'));
  var map = {};
  links.forEach(function(a){ map[a.getAttribute('href').slice(1)] = a; });
  var secs = Array.prototype.slice.call(document.querySelectorAll('section[id]'));
  if ('IntersectionObserver' in window && links.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          links.forEach(function(a){ a.classList.remove('on'); });
          if(map[e.target.id]) map[e.target.id].classList.add('on');
        }
      });
    }, {rootMargin:'-10% 0px -80% 0px', threshold:0});
    secs.forEach(function(s){ io.observe(s); });
  }

  var q = document.getElementById('tagq');
  var rows = Array.prototype.slice.call(document.querySelectorAll('#tagtable tbody tr'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var counter = document.getElementById('tagcount');
  var cat = 'all';

  function apply(){
    var term = (q.value || '').toLowerCase().trim();
    var shown = 0;
    rows.forEach(function(r){
      var okCat = (cat === 'all') || (r.getAttribute('data-cat') === cat);
      var okTerm = !term || r.textContent.toLowerCase().indexOf(term) > -1;
      if (okCat && okTerm){ r.classList.remove('hide'); shown++; }
      else { r.classList.add('hide'); }
    });
    counter.textContent = shown + ' of ' + rows.length + ' attributes';
  }

  if (q){
    q.addEventListener('input', apply);
    chips.forEach(function(c){
      c.addEventListener('click', function(){
        cat = c.getAttribute('data-cat');
        chips.forEach(function(x){ x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        apply();
      });
    });
    apply();
  }
})();
