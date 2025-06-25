import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Dturn_logo.png';
import icon from '../assets/is-greater-than.png';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      {/* ☰ Hamburger toggle for small screens */}
      <button
        className="btn btn-light d-md-none position-fixed top-0 start-0 m-2 z-1030"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#sidebarOffcanvas"
        aria-controls="sidebarOffcanvas"
      >
        ☰
      </button>

      {/* Sidebar for medium and up (visible always) */}
      <div className="d-none d-md-flex flex-column p-3 bg-light position-fixed h-100" style={{ width: '250px' }}>
        <SidebarContent handleLogout={handleLogout} user={user} />
      </div>

      {/* Offcanvas Sidebar for small screens */}
      <div
        className="offcanvas offcanvas-start d-md-none"
        tabIndex="-1"
        id="sidebarOffcanvas"
        aria-labelledby="sidebarOffcanvasLabel" style={{ width: '150px' }}
      >
        <div className="offcanvas-body p-0">
          <SidebarContent handleLogout={handleLogout} user={user} />
        </div>
      </div>
    </>
  );
};

const SidebarContent = ({ handleLogout, user }) => (
  <div className="d-flex flex-column h-100 p-3">
    {/* Logo */}
    <div className="text-center mb-4">
      <img src={logo} alt="Logo" className="img-fluid" style={{ maxHeight: '60px' }} />
    </div>

    {/* Role-based label */}
    <div className="my-auto text-center">
      <ul className="nav nav-pills flex-column w-100">
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
          <li className="nav-item mb-3">
            <span className="nav-link active bg-dark text-white">Projects</span>
          </li>
        )}
        {user?.role === 'USER' && (
          <li className="nav-item mb-3">
            <span className="nav-link active bg-dark text-white">Tasks</span>
          </li>
        )}
      </ul>
    </div>

    {/* Logout button */}
    <div className="mt-auto text-center">
      <button
        onClick={handleLogout}
        className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
      >
        Logout <img src={icon} alt="Logout Icon" className="ms-2" style={{ width: '16px' }} />
      </button>
    </div>
  </div>
);

export default Sidebar;
