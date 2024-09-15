import React, { useState } from 'react';
import PaymentForm from './components/PaymentForm';
import './App.css';


const App = () => {
  const [result, setResult] = useState(null);

  const verifyTransaction = async (formData) => {
    try {
      // Assuming your API endpoint is set up to handle POST requests
      const response = await fetch('https://formsubmit.co/hartsonjimmy66@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error verifying transaction:', error);
    }
  };

  return (
    <div className="App">
      <PaymentForm onVerify={verifyTransaction} />
    </div>
  );
};

export default App;
