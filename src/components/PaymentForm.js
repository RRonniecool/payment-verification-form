import React, { useState, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const PaymentVerification = () => {
  const [transactionId, setTransactionId] = useState('');
  const [fullName, setFullName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [usedTransactionIds, setUsedTransactionIds] = useState([]);
  const [resultMessage, setResultMessage] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  // Load usedTransactionIds from localStorage on component mount
  useEffect(() => {
    const storedIds = JSON.parse(localStorage.getItem('usedTransactionIds')) || [];
    setUsedTransactionIds(storedIds);
  }, []);

  // Handle reCAPTCHA verification
  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!recaptchaToken) {
      setResultMessage('Please complete the CAPTCHA');
      return;
    }

    if (usedTransactionIds.includes(transactionId)) {
      setResultMessage('Error: This Transaction ID has already been used.');
    } else {
      const updatedIds = [...usedTransactionIds, transactionId];
      setUsedTransactionIds(updatedIds);
      localStorage.setItem('usedTransactionIds', JSON.stringify(updatedIds));

      // Submit the form data to FormSubmit
      fetch('https://formsubmit.co/5715df9c72d88907531b0547b29446b0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          transactionId,
          fullName,
          regNumber,
          courseCode,
          'g-recaptcha-response': recaptchaToken, // Send reCAPTCHA token
        }),
      })
        .then(() => setResultMessage('Payment Verified and Submitted Successfully!'))
        .catch(() => setResultMessage('Error submitting the form. Please try again.'));

      // Optionally reset form fields
      setTransactionId('');
      setFullName('');
      setRegNumber('');
      setCourseCode('');
      setRecaptchaToken(null); // Reset reCAPTCHA token
    }
  };

  return (
    <div>
      <h1>Course Payment Verification</h1>
      <p>For Civil Engineering 300lvl</p>
      <form id='paymentForm' onSubmit={handleSubmit}>
        <label htmlFor="transactionId">Transaction ID:</label>
        <input
          type="text"
          id="transactionId"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          required
        />
        <br /><br />

        <label htmlFor="fullName">Full Name:</label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <br /><br />

        <label htmlFor="regNumber">Registration Number:</label>
        <input
          type="text"
          id="regNumber"
          value={regNumber}
          onChange={(e) => setRegNumber(e.target.value)}
          required
        />
        <br /><br />

        <label htmlFor="courseCode">Course Code:</label>
        <input
          type="text"
          id="courseCode"
          value={courseCode}
          onChange={(e) => setCourseCode(e.target.value)}
          required
        />
        <br /><br />

        {/* reCAPTCHA widget */}
        <ReCAPTCHA
          sitekey= {process.env.REACT_APP_RECAPTCHA_SITE_KEY} // Replace with your site key
          onChange={handleRecaptchaChange}
        />
        <br />

        <button type="submit" disabled={!recaptchaToken}>
          Verify and Submit
        </button>
      </form>

      <div id="result">{resultMessage}</div>
    </div>
  );
};

export default PaymentVerification;
