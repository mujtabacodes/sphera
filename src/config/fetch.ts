import axios from 'axios';
export const fetchUserData = async () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('authToken='))
      ?.split('=')[1];
  
    const response = await axios.get('/api/user/login', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  
    return response.data;
  };
  