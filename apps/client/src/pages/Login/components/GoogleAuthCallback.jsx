import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../../app/auth/authSlice'; // Adjust path as needed
import Swal from 'sweetalert2';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    if (error === 'account_not_found' || error === 'user_not_exists') {
      navigate('/register-google');
      return;
    }
    
    if (token) {
      try {
        
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        
        
        if (decodedPayload.isNewUser || decodedPayload.needsRegistration) {
          navigate('/register-google');
          return;
        }
        
        
        dispatch(loginSuccess({
          token: token,
          user: {
            userId: decodedPayload.userId,
            email: decodedPayload.email,
            role: decodedPayload.role
          }
        }));

        
        localStorage.setItem('token', token);

        Swal.fire({
          title: 'Login Successful',
          text: 'You are now logged in with Google',
          icon: 'success',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#efb100',
        }).then(() => {
          if (decodedPayload.role === 'seller') {
            navigate('/restaurant-dashboard');
          } else {
            navigate('/home');
          }
        });
      } catch (error) {
        console.error('Error processing Google auth:', error);
        Swal.fire({
          title: 'Authentication Error',
          text: 'There was an error processing your Google login',
          icon: 'error',
          confirmButtonText: 'Ok',
          confirmButtonColor: '#ef4444',
        });
        navigate('/login');
      }
    } else {
      Swal.fire({
        title: 'Authentication Failed',
        text: 'Google authentication was unsuccessful',
        icon: 'error',
        confirmButtonText: 'Ok',
        confirmButtonColor: '#ef4444',
      });
      navigate('/login');
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing Google authentication...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;