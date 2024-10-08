import React, { useState, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const PaymentVerification = () => {
  const [transactionId, setTransactionId] = useState('');
  const [fullName, setFullName] = useState('');
  const [Amount, setAmount] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [usedTransactionIds, setUsedTransactionIds] = useState([]);
  const [resultMessage, setResultMessage] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [messageColor, setMessageColor] = useState('');

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
      setMessageColor('red');
      return;
    }
  
    // Step 1: Check if transaction ID is already used
    fetch('https://verif-in-nodejs-production.up.railway.app/check-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transactionId }),
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === 'This Transaction ID has already been used.') {
        setResultMessage('Error: This Transaction ID has already been used.');
        setMessageColor('red');
      } else {
        // Step 2: Submit the form data to FormSpree.com
        fetch('https://formspree.io/f/mldrybrn', {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            transactionId,
            Amount,
            fullName,
            regNumber,
            courseCode,
            'g-recaptcha-response': recaptchaToken,
          }),
        })
        .then(() => {
          setResultMessage('Payment Verified and Submitted Successfully!');
          setMessageColor('green');
          // Update usedTransactionIds and store in localStorage
          const updatedIds = [...usedTransactionIds, transactionId];
          setUsedTransactionIds(updatedIds);
          localStorage.setItem('usedTransactionIds', JSON.stringify(updatedIds));
        })
        .catch(() => {
          setResultMessage('Error submitting the form. Please try again.');
          setMessageColor('red');
        });
      }
    })
    .catch(() => {
      setResultMessage('Error: Could not verify transaction ID.');
      setMessageColor('red');
    });
  };

  return (
    <div>
      <h1>Course Payment Upload</h1>
      <form id="paymentForm" onSubmit={handleSubmit}>
        <label htmlFor="transactionId">Transaction ID/Reference:</label>
        <input
          type="text"
          id="transactionId"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          required
        />
        <br /><br />

        <label htmlFor="Amount">Amount:</label> 
        <input
          type="text"
          id="Amount"
          value={Amount}
          onKeyPress={(e) => {
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault(); // Block non-numeric input
            }
          }}
          onChange={(e) => setAmount(e.target.value)}
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
          onKeyPress={(e) => {
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault(); // Block non-numeric input
            }
          }}
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
          sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY} // Replace with your site key
          onChange={handleRecaptchaChange}
        />
        <br />

        <button type="submit" disabled={!recaptchaToken}>
          Verify and Submit
        </button>
      </form>

      <div id="result" style={{ color: messageColor }}>{resultMessage}</div>
    </div>
  );
};

export default PaymentVerification;
