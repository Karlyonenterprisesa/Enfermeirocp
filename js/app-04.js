    function openYoutubeModal(videoId) {
      const modal = document.getElementById('youtubeModal');
      const player = document.getElementById('youtubePlayer');
      player.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
      modal.style.display = 'flex';
    }
    function closeYoutubeModal() {
      const modal = document.getElementById('youtubeModal');
      const player = document.getElementById('youtubePlayer');
      modal.style.display = 'none';
      player.src = '';
    }
