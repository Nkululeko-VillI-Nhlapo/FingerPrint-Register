import { supabase } from './supabase.js';

const learnerSelect = document.getElementById("learnerSelect");
const registerBtn = document.getElementById("registerBtn");
const verifyBtn = document.getElementById("verifyBtn");
const statusDiv = document.getElementById("status");

// Utility: ArrayBuffer <=> Base64
function bufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
function base64ToBuffer(base64) {
  const binary = atob(base64);
  return Uint8Array.from(binary, char => char.charCodeAt(0)).buffer;
}

// 🔄 Load learners from Supabase
async function loadLearners() {
  const { data, error } = await supabase
    .from('learners')
    .select('id, full_name')
    .eq('registered', false); // Only unregistered learners

  if (error) {
    statusDiv.innerText = "❌ Failed to load learners.";
    console.error(error);
    return;
  }

  learnerSelect.innerHTML = `<option value="">-- Choose a learner --</option>`;
  data.forEach(learner => {
    const option = document.createElement("option");
    option.value = learner.id;
    option.textContent = learner.full_name;
    learnerSelect.appendChild(option);
  });
}

// 📝 Register Fingerprint
registerBtn.onclick = async () => {
  const learnerId = learnerSelect.value;
  if (!learnerId) {
    statusDiv.innerText = "⚠️ Please select your name before registering.";
    return;
  }

  statusDiv.innerText = "🔐 Registering fingerprint...";

  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const publicKey = {
      challenge,
      rp: { name: "Fingerprint Attendance App" },
      user: {
        id: Uint8Array.from(learnerId, c => c.charCodeAt(0)),
        name: "learner@example.com",
        displayName: "Learner"
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "direct"
    };

    const credential = await navigator.credentials.create({ publicKey });

    const encodedId = bufferToBase64(credential.rawId);
    const attestationObject = bufferToBase64(credential.response.attestationObject);

    // Store credential in Supabase
    const { error: insertError } = await supabase
      .from('biometric_credentials')
      .insert({
        learner_id: learnerId,
        credential_id: encodedId,
        public_key: attestationObject
      });

    if (insertError) throw insertError;

    // Mark learner as registered
    await supabase
      .from('learners')
      .update({ registered: true })
      .eq('id', learnerId);

    localStorage.setItem("fingerprintId", encodedId);
    localStorage.setItem("learnerId", learnerId);

    statusDiv.innerText = "✅ Fingerprint Registered Successfully!";
    await loadLearners(); // Refresh list
  } catch (err) {
    console.error("Registration failed:", err);
    statusDiv.innerText = `❌ Registration Failed: ${err.message}`;
  }
};

// ✅ Verify Fingerprint & Mark Attendance
verifyBtn.onclick = async () => {
  const learnerId = localStorage.getItem("learnerId");
  const encodedId = localStorage.getItem("fingerprintId");

  if (!learnerId || !encodedId) {
    statusDiv.innerText = "❗ No fingerprint registered. Please register first.";
    return;
  }

  statusDiv.innerText = "🔍 Verifying fingerprint...";

  try {
    const rawId = base64ToBuffer(encodedId);
    const publicKey = {
      challenge: new Uint8Array(32),
      allowCredentials: [{
        type: "public-key",
        id: rawId,
        transports: ["internal"]
      }],
      timeout: 60000,
      userVerification: "required"
    };

    await navigator.credentials.get({ publicKey });

    const today = new Date().toISOString().split('T')[0];

    const { data: existing, error: fetchError } = await supabase
      .from('attendance')
      .select('*')
      .eq('learner_id', learnerId)
      .gte('check_in_time', today);

    if (fetchError) throw fetchError;

    if (existing.length === 0) {
      // Insert new attendance record
      await supabase.from('attendance').insert({
        learner_id: learnerId,
        status: 'present'
      });
    } else {
      // Update existing record
      await supabase
        .from('attendance')
        .update({ status: 'present', check_in_time: new Date() })
        .eq('id', existing[0].id);
    }

    statusDiv.innerText = "✅ Fingerprint Verified! Attendance marked.";
  } catch (err) {
    console.error("Verification failed:", err);
    statusDiv.innerText = `❌ Verification Failed: ${err.message}`;
  }
};

// 🔄 Load learners on page load
loadLearners();
