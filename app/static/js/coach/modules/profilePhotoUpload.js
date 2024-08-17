document.addEventListener('DOMContentLoaded', function() {
  const profilePhotoInput = document.getElementById('profilePhotoInput');
  const profilePreview = document.getElementById('profilePreview');
  const certificatePhotoInput = document.getElementById('certificatePhotoInput');
  const coachCertificates = document.getElementById('coachCertificates');
  const editCertificatesBtn = document.getElementById('editCertificates');
  const certificateUpload = document.getElementById('certificateUpload');

  // Profile photo preview
  profilePhotoInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        profilePreview.src = e.target.result;
      }
      reader.readAsDataURL(file);
    }
  });

  // Certificate editing
  let isEditingCertificates = false;

  editCertificatesBtn.addEventListener('click', function() {
    isEditingCertificates = !isEditingCertificates;
    certificateUpload.classList.toggle('hidden', !isEditingCertificates);

    if (isEditingCertificates) {
      // Add delete buttons to existing certificates
      const certificates = coachCertificates.querySelectorAll('img');
      certificates.forEach(img => {
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.className = 'absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center';
        deleteBtn.onclick = function() {
          img.parentElement.remove();
        };
        const wrapper = document.createElement('div');
        wrapper.className = 'relative';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        wrapper.appendChild(deleteBtn);
      });
    } else {
      // Remove delete buttons
      const deleteButtons = coachCertificates.querySelectorAll('button');
      deleteButtons.forEach(btn => btn.remove());
      // Unwrap images
      const wrappers = coachCertificates.querySelectorAll('.relative');
      wrappers.forEach(wrapper => {
        const img = wrapper.querySelector('img');
        wrapper.parentNode.insertBefore(img, wrapper);
        wrapper.remove();
      });
    }
  });

  // Certificate photo preview
  certificatePhotoInput.addEventListener('change', function(event) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = function(e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = 'Certificate Photo';
        img.className = 'w-40 h-40 object-cover rounded';
        const wrapper = document.createElement('div');
        wrapper.className = 'relative';
        wrapper.appendChild(img);
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '&times;';
        deleteBtn.className = 'absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center';
        deleteBtn.onclick = function() {
          wrapper.remove();
        };
        wrapper.appendChild(deleteBtn);
        coachCertificates.appendChild(wrapper);
      }
      reader.readAsDataURL(file);
    }
  });
});
