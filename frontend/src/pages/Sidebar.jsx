import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import logo from '../assets/Dturn_logo.png';
import icon from '../assets/is-greater-than.png';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery({ maxWidth: 999 }); // 👈 screen < 1000px

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <>
      {/* Hamburger toggle only if small screen */}
      {isSmallScreen && (
        <button
          className="btn btn-light position-absolute top-0 start-0 m-2 z-1030 shadow"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarOffcanvas"
          aria-controls="sidebarOffcanvas"
        >
          ☰
        </button>
      )}

      {/* Static Sidebar for large screen */}
      {!isSmallScreen && (
        <div
          className="d-flex flex-column p-3 position-fixed"
          style={{
            width: '240px',
            height: '100vh',
            backgroundColor: '#dddedf',
            top: 0,
            left: 0,
          }}
        >
          <SidebarContent handleLogout={handleLogout} user={user} />
        </div>
      )}

      {/* Offcanvas for mobile */}
      {isSmallScreen && (
        <div
          className="offcanvas offcanvas-start"
          tabIndex="-1"
          id="sidebarOffcanvas"
          aria-labelledby="sidebarOffcanvasLabel"
          style={{ width: '220px' }}
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="sidebarOffcanvasLabel">
              Menu
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            />
          </div>
          <div className="offcanvas-body p-0">
            <SidebarContent handleLogout={handleLogout} user={user} />
          </div>
        </div>
      )}
    </>
  );
};

const SidebarContent = ({ user, handleLogout }) => (
  <div className="d-flex flex-column h-100 px-3 pt-3">
    <div className="text-center mb-4">
      <img src={logo} alt="Logo" className="img-fluid" style={{ maxHeight: '50px' }} />
    </div>

    <div className="flex-grow-1 text-center mt-5">
      <ul className="nav flex-column w-100 mt-5">
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
          <li className="nav-item mb-3">
            <span className="nav-link active bg-dark text-white rounded mt-5">Projects</span>
          </li>
        )}
        {user?.role === 'USER' && (
          <li className="nav-item mb-3">
            <span className="nav-link active bg-dark text-white rounded mt-5">Tasks</span>
          </li>
        )}
      </ul>
    </div>

    <div className="text-center mt-auto pb-3">
      <button
        className="btn btn-outline-danger d-flex align-items-center justify-content-center w-100"
        onClick={handleLogout}
      >
        Logout <img src={icon} alt="Logout Icon" className="ms-2" style={{ width: '16px' }} />
      </button>
    </div>
  </div>
);

export default Sidebar;
