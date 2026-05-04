/* JavaScript Document

Tooplate 2155 Modern Musician

https://www.tooplate.com/view/2155-modern-musician

*/

document.addEventListener('DOMContentLoaded', function () {
   // Mobile Navigation
   const navToggle = document.querySelector('.nav-toggle');
   const nav = document.querySelector('.nav');

   navToggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('active');
      navToggle.setAttribute('aria-expanded', isOpen);
   });

   document.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
         nav.classList.remove('active');
         navToggle.setAttribute('aria-expanded', 'false');
      });
   });

   // =====================
   // Audio Player
   // =====================
   const audio = document.getElementById('audio');
   const playBtn = document.getElementById('playBtn');
   const iconPlay = playBtn.querySelector('.icon-play');
   const iconPause = playBtn.querySelector('.icon-pause');
   const progressBar = document.getElementById('progressBar');
   const progress = document.getElementById('progress');
   const progressHandle = document.getElementById('progressHandle');
   const currentTimeEl = document.getElementById('currentTime');
   const durationEl = document.getElementById('duration');
   const volumeSlider = document.getElementById('volumeSlider');
   const visualizer = document.getElementById('visualizer');

   let isDragging = false;
   let audioDuration = 0;
   let isPlayPending = false;

   // Set default volume to 60%
   audio.volume = 0.6;

   // Format time as m:ss
   function formatTime(seconds) {
      if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return mins + ':' + (secs < 10 ? '0' : '') + secs;
   }

   // Update progress bar UI
   function updateProgressUI(percent) {
      percent = Math.max(0, Math.min(100, percent));
      progress.style.width = percent + '%';
      progressHandle.style.left = percent + '%';
   }

   // Get percent from mouse/touch position
   function getPercentFromEvent(e) {
      const rect = progressBar.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let percent = ((clientX - rect.left) / rect.width) * 100;
      return Math.max(0, Math.min(100, percent));
   }

   // Seek to percent
   function seekToPercent(percent) {
      if (audioDuration > 0) {
         audio.currentTime = (percent / 100) * audioDuration;
      }
   }

   // ---- Play/Pause ----
   playBtn.addEventListener('click', function () {
      if (isPlayPending) return; // Prevent multiple clicks while loading

      if (audio.paused) {
         isPlayPending = true;
         playBtn.style.opacity = '0.7';

         const playPromise = audio.play();

         if (playPromise !== undefined) {
            playPromise
               .then(function () {
                  isPlayPending = false;
                  playBtn.style.opacity = '1';
               })
               .catch(function (err) {
                  isPlayPending = false;
                  playBtn.style.opacity = '1';
                  console.log('Playback error:', err.name, err.message);
               });
         } else {
            isPlayPending = false;
            playBtn.style.opacity = '1';
         }
      } else {
         audio.pause();
      }
   });

   audio.addEventListener('play', function () {
      iconPlay.style.display = 'none';
      iconPause.style.display = 'block';
      if (visualizer) visualizer.classList.add('playing');
   });

   audio.addEventListener('pause', function () {
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
      if (visualizer) visualizer.classList.remove('playing');
   });

   // ---- Duration & Time Update ----
   audio.addEventListener('loadedmetadata', function () {
      audioDuration = audio.duration;
      durationEl.textContent = formatTime(audioDuration);
   });

   audio.addEventListener('durationchange', function () {
      audioDuration = audio.duration;
      durationEl.textContent = formatTime(audioDuration);
   });

   audio.addEventListener('timeupdate', function () {
      if (!isDragging && audioDuration > 0) {
         const percent = (audio.currentTime / audioDuration) * 100;
         updateProgressUI(percent);
         currentTimeEl.textContent = formatTime(audio.currentTime);
      }
   });

   audio.addEventListener('ended', function () {
      iconPlay.style.display = 'block';
      iconPause.style.display = 'none';
      if (visualizer) visualizer.classList.remove('playing');
      updateProgressUI(0);
   });

   // ---- Click to Seek ----
   progressBar.addEventListener('click', function (e) {
      if (isDragging) return;
      const percent = getPercentFromEvent(e);
      updateProgressUI(percent);
      seekToPercent(percent);
      currentTimeEl.textContent = formatTime((percent / 100) * audioDuration);
   });

   // ---- Drag to Seek ----
   function startDrag(e) {
      if (audioDuration <= 0) return;
      isDragging = true;
      progressHandle.classList.add('dragging');
      document.body.style.cursor = 'grabbing';
      handleDrag(e);
   }

   function handleDrag(e) {
      if (!isDragging) return;
      e.preventDefault();
      const percent = getPercentFromEvent(e);
      updateProgressUI(percent);
      currentTimeEl.textContent = formatTime((percent / 100) * audioDuration);
   }

   function endDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      progressHandle.classList.remove('dragging');
      document.body.style.cursor = '';
      const percent = parseFloat(progress.style.width) || 0;
      seekToPercent(percent);
   }

   // Mouse events
   progressHandle.addEventListener('mousedown', startDrag);
   document.addEventListener('mousemove', handleDrag);
   document.addEventListener('mouseup', endDrag);

   // Touch events
   progressHandle.addEventListener('touchstart', startDrag, {
      passive: false
   });
   document.addEventListener('touchmove', handleDrag, {
      passive: false
   });
   document.addEventListener('touchend', endDrag);

   // ---- Scroll to Seek ----
   progressBar.addEventListener('wheel', function (e) {
      e.preventDefault();
      if (audioDuration <= 0) return;

      // Scroll up = forward, scroll down = backward
      // 2 seconds per scroll tick for precision
      const delta = e.deltaY > 0 ? -2 : 2;
      const newTime = Math.max(0, Math.min(audioDuration, audio.currentTime + delta));
      audio.currentTime = newTime;

      const percent = (newTime / audioDuration) * 100;
      updateProgressUI(percent);
      currentTimeEl.textContent = formatTime(newTime);
   }, {
      passive: false
   });

   // ---- Volume Slider ----
   volumeSlider.addEventListener('input', function () {
      audio.volume = this.value / 100;
   });

   // ---- Error Handling ----
   audio.addEventListener('error', function (e) {
      console.log('Audio error:', audio.error);
      durationEl.textContent = '--:--';
   });

   // Debug: Log when audio can play
   audio.addEventListener('canplay', function () {
      console.log('Audio ready to play, duration:', audio.duration);
      audioDuration = audio.duration;
      durationEl.textContent = formatTime(audioDuration);
   });
});