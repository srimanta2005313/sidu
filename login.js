document.addEventListener("DOMContentLoaded", function () {
    // Select tab elements and forms
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
  
    // Select buttons and fields
    const loginButton = document.getElementById('login-button');
    const signupButton = document.getElementById('signup-button');
  
    // Function to switch to Login form
    function switchToLogin() {
      loginTab.classList.add('active');
      signupTab.classList.remove('active');
      loginForm.classList.add('active');
      signupForm.classList.remove('active');
    }
  
    // Function to switch to Signup form
    function switchToSignup() {
      signupTab.classList.add('active');
      loginTab.classList.remove('active');
      signupForm.classList.add('active');
      loginForm.classList.remove('active');
    }
  
    // Click event for tab switching
    loginTab.addEventListener('click', switchToLogin);
    signupTab.addEventListener('click', switchToSignup);
  
    // Extra link events for switching (if present in HTML)
    const switchToSignupLink = document.getElementById('switch-to-signup');
    if (switchToSignupLink) {
      switchToSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchToSignup();
      });
    }
  
    const switchToLoginLink = document.getElementById('switch-to-login');
    if (switchToLoginLink) {
      switchToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchToLogin();
      });
    }
  
    // Login button click event
    loginButton.addEventListener('click', async (e) => {
      e.preventDefault();
  
      const userId = document.getElementById('login-userid').value;
      const password = document.getElementById('login-password').value;
      // Correct element ID for user type is "login-user-type"
      const userType = document.getElementById('login-user-type').value;
  
      if (!userId || !password) {
        alert('Please enter both ID and password.');
        return;
      }
  
      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, password, userType })
        });
  
        const result = await response.json();
  
        if (result.success) {
          alert(result.message);
          // Redirect based on user type
          window.location.href = userType === 'Admin' ? 'admin_dashboard.html' : 'user_dashboard.html';
        } else {
          alert(result.message);
        }
      } catch (error) {
        alert('Server error. Please try again later.');
      }
    });
  
    // Signup button click event (rectified)
    signupButton.addEventListener('click', async (e) => {
      e.preventDefault();
  
      const name = document.getElementById('signup-name').value;
      const userId = document.getElementById('signup-userid').value;
      const password = document.getElementById('signup-password').value;
      const userType = 'User'; // Defaulting to "User"
  
      if (!name || !userId || !password) {
        alert('All fields are required.');
        return;
      }
  
      try {
        const response = await fetch('/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, password, name, userType })
        });
  
        const result = await response.json();
        console.log(result);
        if (result.success) {
          alert(result.message);
          switchToLogin(); // Switch to login after successful signup
        } else {
          alert(result.message);
        }
      } catch (error) {
        alert('Server error. Please try again later.');
      }
    });
  
    // Ensure default view is Login Form
    switchToLogin();
  });
  