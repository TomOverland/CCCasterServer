import React from 'react';
import { Link } from 'react-router-dom';

const AuthenticationButton = () => {
  return (
    <div>
      <ul>
        <li>
          <Link to={{ pathname: '/home' }}>Sign in!</Link>
        </li>
      </ul>
    </div>
  );
};

export default AuthenticationButton;
