const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dx8czzxhe',
  api_key: '368515786499733',
  api_secret: '1Bo9_W9_bULVA2nbEZfsXrEAym8'
});

async function createPreset() {
  try {
    const result = await cloudinary.api.create_upload_preset({
      name: 'bait_al_watan',
      unsigned: true,
      folder: 'bait_al_watan'
    });
    console.log('Success:', result);
  } catch (error) {
    if (error.error && error.error.message.includes('already exists')) {
      console.log('Preset already exists, everything is fine!');
    } else {
      console.error('Error:', error);
    }
  }
}

createPreset();
