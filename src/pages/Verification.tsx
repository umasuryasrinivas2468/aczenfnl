import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

const Verification: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [panNumber, setPanNumber] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/verify-pan', {
        PAN: panNumber,
        DOB: dob
      });

      if (response.data.success) {
        toast({
          title: "Verification Successful",
          description: "Your PAN and DOB have been verified successfully.",
        });
        // Navigate to home screen after successful verification
        navigate('/');
      } else {
        toast({
          title: "Verification Failed",
          description: response.data.message || "Please check your details and try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred during verification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validatePAN = (pan: string) => {
    // PAN format: ABCDE1234F (5 letters, 4 numbers, 1 letter)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const handlePANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 10) {
      setPanNumber(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            PAN Verification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your PAN number and Date of Birth for verification
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleVerification}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-1">
                PAN Number
              </label>
              <Input
                id="pan"
                name="pan"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Enter PAN (e.g., ABCDE1234F)"
                value={panNumber}
                onChange={handlePANChange}
                maxLength={10}
                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                title="Please enter a valid PAN number (e.g., ABCDE1234F)"
              />
              {panNumber && !validatePAN(panNumber) && (
                <p className="mt-1 text-sm text-red-600">
                  Please enter a valid PAN number (e.g., ABCDE1234F)
                </p>
              )}
            </div>
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <Input
                id="dob"
                name="dob"
                type="date"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              disabled={loading || !validatePAN(panNumber) || !dob}
            >
              {loading ? 'Verifying...' : 'Verify Details'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Verification; 