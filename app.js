  function openModal(theme){
    var box=document.querySelector('#modal .join-box');
    box.classList.remove('theme-blue','theme-green');
    if(theme==='blue')box.classList.add('theme-blue');
    else if(theme==='green')box.classList.add('theme-green');
    document.getElementById('modal').classList.add('on');
  }
  function closeModal(){document.getElementById('modal').classList.remove('on')}
  document.getElementById('modal').addEventListener('click',function(e){if(e.target===this)closeModal()});
  function tq(btn){btn.parentElement.classList.toggle('open')}
  function toggleDrop(btn){btn.closest('.has-dropdown').classList.toggle('open')}
  var _platform='uber';
  function showPlatform(name){
    _platform=name;
    document.querySelectorAll('.ptab').forEach(function(t){t.classList.toggle('is-active',t.dataset.tab===name)});
    document.querySelectorAll('.pslide').forEach(function(p){p.classList.toggle('is-active',p.dataset.panel===name)});
    var cur=document.querySelector('.pcur');if(cur)cur.textContent=(name==='uber'?'Uber':'Bolt');
  }
  function platformNav(dir){var o=['uber','bolt'];showPlatform(o[(o.indexOf(_platform)+dir+2)%2])}
  document.addEventListener('click',function(e){
    if(!e.target.closest('.has-dropdown')){
      document.querySelectorAll('.has-dropdown.open').forEach(function(d){d.classList.remove('open')});
    }
  });
  function toggleMenu(){var m=document.querySelector('.menu');m.style.display=(m.style.display==='flex')?'none':'flex';m.style.flexDirection='column';m.style.position='absolute';m.style.top='70px';m.style.left='0';m.style.right='0';m.style.background='#fff';m.style.padding='16px 20px';m.style.borderBottom='1px solid var(--line)'}
  function submitForm(e,id){e.preventDefault();e.target.style.display='none';document.getElementById('ok-'+id).style.display='block';return false}
  function toggleFilter(btn){btn.closest('.filter-group').classList.toggle('open')}
  function setSort(el){document.querySelectorAll('.sort-opt').forEach(function(o){o.classList.remove('is-active')});el.classList.add('is-active')}
  function toggleReq(btn){btn.closest('.car-card').classList.toggle('req-open')}
