export function TermsOfService() {
  return (
    <div style={{ maxWidth: 800, margin: 'auto', padding: '40px 20px', minHeight: '100vh', color: 'rgba(255,255,255,0.8)' }}>
      <h1 style={{ color: 'white', marginBottom: '24px' }}>Terms of Service</h1>
      <p style={{ marginBottom: '16px' }}>Last Updated: {new Date().toLocaleDateString()}</p>
      
      <h2 style={{ color: 'white', marginTop: '32px', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
      <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>By accessing or using our application, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

      <h2 style={{ color: 'white', marginTop: '32px', marginBottom: '16px' }}>2. User Conduct</h2>
      <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, or impairs the service.</p>

      <h2 style={{ color: 'white', marginTop: '32px', marginBottom: '16px' }}>3. Content Ownership</h2>
      <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>You retain all rights to the content you post, but you grant us a license to use, store, and display that content to provide the service.</p>

      <h2 style={{ color: 'white', marginTop: '32px', marginBottom: '16px' }}>4. Termination</h2>
      <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>We reserve the right to suspend or terminate your account at our sole discretion without notice for conduct that we believe violates these Terms.</p>
    </div>
  );
}
