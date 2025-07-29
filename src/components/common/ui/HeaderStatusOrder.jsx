import { memo } from 'react';
function HeaderStatusOrder({ handleTabClick, activeTab, STATUS_ENTRIES }) {
  return (
    <nav className="header__nav header__nav--status">
      {STATUS_ENTRIES.map(([key, name]) => (
        <button
          key={key}
          className={`header__nav-item ${activeTab === key ? 'active' : ''}`}
          onClick={() => handleTabClick(key)}
        >
          {name}
        </button>
      ))}
    </nav>
  );
}

export default memo(HeaderStatusOrder);
