export function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: '40px 20px', minHeight: '100vh', color: 'rgba(255,255,255,0.8)' }}>
      <h1 style={{ color: 'white', marginBottom: '24px' }}>Privacy Policy</h1>
      <p style={{ marginBottom: '16px' }}>Last Updated: {new Date().toLocaleDateString()}</p>
      
      <h2 style={{ color: 'white', marginTop: '32px', marginBottom: '16px' }}>1. Information We Collect</h2>
      <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>We collect information you provide directly to us, such as when you create an account, update your profile, or use our messaging and call services. This includes your email, display name, and uploaded media.</p>

      <h2 style={{ color: 'white', marginTop: '32px', marginBottom: '16px' }}>2. How We Use Information</h2>
      <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>We use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you.</p>

      <h2 style={{ color: 'white', marginTop: '32px', marginBottom: '16px' }}>3. Security</h2>
      <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</p>

      <h2 style={{ color: 'white', marginTop: '32px', marginBottom: '16px' }}>4. Contact Us</h2>
      <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>If you have any questions about this Privacy Policy, please contact us at privacy@example.com.</p>
    </div>
  );
}
