const statusDiv = document.getElementById("status");

async function registerFingerprint() {
  try {
    const publicKey = {
      challenge: new Uint8Array(32),
      rp: { name: "Fingerprint Attendance" },
      user: {
        id: new Uint8Array(16),
        name: "user@example.com",
        displayName: "User"
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "none"
    };

    const credential = await navigator.credentials.create({ publicKey });

    // Save ID locally (later this goes to Firebase)
    localStorage.setItem("fingerprintId", credential.id);
    statusDiv.innerText = "✅ Fingerprint Registered!";
  } catch (err) {
    console.error(err);
    statusDiv.innerText = "❌ Registration Failed: " + err.message;
  }
}

async function verifyFingerprint() {
  try {
    const id = localStorage.getItem("fingerprintId");

    if (!id) {
      statusDiv.innerText = "❗ No fingerprint registered!";
      return;
    }

    const publicKey = {
      challenge: new Uint8Array(32),
      allowCredentials: [{
        id: Uint8Array.from(atob(id), c => c.charCodeAt(0)),
        type: "public-key",
        transports: ["internal"]
      }],
      timeout: 60000,
      userVerification: "required"
    };

    const assertion = await navigator.credentials.get({ publicKey });
    statusDiv.innerText = "✅ Fingerprint Verified!";
  } catch (err) {
    console.error(err);
    statusDiv.innerText = "❌ Verification Failed: " + err.message;
  }
}

