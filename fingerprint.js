// Utility to convert ArrayBuffer to base64
function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// Utility to convert base64 to ArrayBuffer
function base64ToBuffer(base64) {
  const binary = atob(base64);
  return Uint8Array.from(binary, char => char.charCodeAt(0)).buffer;
}

// Select the status div for feedback
const statusDiv = document.getElementById("status");

// Register the fingerprint using WebAuthn (FIDO2)
async function registerFingerprint() {
  console.log("Registering fingerprint...");

  try {
    const publicKey = {
      challenge: new Uint8Array(32), // Normally random from server
      rp: { name: "Fingerprint Attendance App" },
      user: {
        id: Uint8Array.from("unique-user-id", c => c.charCodeAt(0)),
        name: "learner@example.com",
        displayName: "Learner Name"
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Use built-in fingerprint scanner
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "direct"
    };

    const credential = await navigator.credentials.create({ publicKey });

    // Convert rawId to base64
    const rawId = credential.rawId;
    const encodedId = bufferToBase64(rawId);

    // Store the credential ID locally for this example
    localStorage.setItem("fingerprintId", encodedId);
    console.log("Stored Fingerprint ID:", encodedId);

    statusDiv.innerText = "✅ Fingerprint Registered Successfully!";
  } catch (error) {
    console.error("Registration failed:", error);
    statusDiv.innerText = `❌ Registration Failed: ${error.message}`;
  }
}

// Verify the fingerprint by triggering WebAuthn assertion
async function verifyFingerprint() {
  console.log("Verifying fingerprint...");

  const encodedId = localStorage.getItem("fingerprintId");

  // Handle missing or invalid ID
  if (!encodedId || encodedId === "undefined") {
    statusDiv.innerText = "❗ No fingerprint registered. Please register first.";
    return;
  }

  try {
    const rawId = base64ToBuffer(encodedId);

    const publicKey = {
      challenge: new Uint8Array(32), // Should match server-generated challenge
      allowCredentials: [{
        type: "public-key",
        id: rawId,
        transports: ["internal"]
      }],
      timeout: 60000,
      userVerification: "required"
    };

    const assertion = await navigator.credentials.get({ publicKey });

    // If no error was thrown, verification passed
    statusDiv.innerText = "✅ Fingerprint Verified. Attendance Marked!";
    console.log("Assertion:", assertion);
  } catch (error) {
    console.error("Verification failed:", error);
    statusDiv.innerText = `❌ Verification Failed: ${error.message}`;
  }
}
