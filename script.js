// Get reference to the div where we show status messages
const statusDiv = document.getElementById("status");

// ---------------------------------------
// Register Fingerprint Button Click Logic
// ---------------------------------------
async function registerFingerprint() {
  try {
    // Create the public key credential creation options
    const publicKey = {
      challenge: new Uint8Array(32), // Random challenge (should come from backend ideally)
      rp: { name: "Fingerprint Attendance" }, // Relying party (your app)
      user: {
        id: new Uint8Array(16), // Random user ID (in real use, this should be unique per user)
        name: "user@example.com", // User name (placeholder)
        displayName: "User" // What to show in browser UI
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }], // Acceptable algorithms
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Use the device’s built-in biometric
        userVerification: "required" // Require fingerprint or other verification
      },
      timeout: 60000, // Timeout in milliseconds
      attestation: "none" // We don’t need device attestation
    };

    // Trigger the browser to start fingerprint registration
    const credential = await navigator.credentials.create({ publicKey });

    // Convert the binary rawId (unique ID for this fingerprint credential)
    // to Base64 string before saving to localStorage
    const encodedId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
    localStorage.setItem("fingerprintId", encodedId); // Save fingerprint ID locally

    // Let the user know it worked
    statusDiv.innerText = "✅ Fingerprint Registered!";
  } catch (err) {
    console.error(err);
    statusDiv.innerText = "❌ Registration Failed: " + err.message;
  }
}

// ----------------------------------------
// Verify Fingerprint Button Click Logic
// ----------------------------------------
async function verifyFingerprint() {
  try {
    // Get the stored fingerprint credential ID from localStorage
    const encodedId = localStorage.getItem("fingerprintId");

    if (!encodedId) {
      // If no ID is stored, show error
      statusDiv.innerText = "❗ No fingerprint registered!";
      return;
    }

    // Decode the Base64 string back to ArrayBuffer for verification
    const rawId = Uint8Array.from(atob(encodedId), c => c.charCodeAt(0)).buffer;

    // Create verification request options
    const publicKey = {
      challenge: new Uint8Array(32), // Random challenge again
      allowCredentials: [{
        id: rawId, // This is the credential ID the user must match
        type: "public-key",
        transports: ["internal"] // Use built-in authenticator (e.g. fingerprint)
      }],
      timeout: 60000,
      userVerification: "required"
    };

    // Trigger fingerprint scan
    const assertion = await navigator.credentials.get({ publicKey });

    // If the fingerprint matched the stored credential, success!
    statusDiv.innerText = "✅ Fingerprint Verified!";
  } catch (err) {
    console.error(err);
    statusDiv.innerText = "❌ Verification Failed: " + err.message;
  }
}
