import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './CaptionSettings.css';

const CaptionSettings = ({ userPreferences, onUpdatePreferences }) => {
  const [localPreferences, setLocalPreferences] = useState(userPreferences);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('boxDimensions.')) {
      const dimension = name.split('.')[1];
      setLocalPreferences((prev) => ({
        ...prev,
        boxDimensions: {
          ...prev.boxDimensions,
          [dimension]: value,
        },
      }));
    } else {
      setLocalPreferences((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleToggle = () => {
    setLocalPreferences((prev) => ({
      ...prev,
      captionsEnabled: !prev.captionsEnabled,
    }));
  };

  const handleApply = () => {
    onUpdatePreferences(localPreferences);
  };

  return (
    <div className="caption-settings">
      <h3>Caption Settings</h3>

      <label>
        Font Style:
        <select
          name="fontStyle"
          value={localPreferences.fontStyle}
          onChange={handleChange}
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="Georgia">Georgia</option>
        </select>
      </label>

      <label>
        Font Size:
        <input
          type="text"
          name="fontSize"
          value={localPreferences.fontSize}
          onChange={handleChange}
        />
      </label>

      <label>
        Font Color:
        <input
          type="color"
          name="fontColor"
          value={localPreferences.fontColor}
          onChange={handleChange}
        />
      </label>

      <label>
        Background Color:
        <input
          type="color"
          name="backgroundColor"
          value={localPreferences.backgroundColor}
          onChange={handleChange}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={localPreferences.captionsEnabled}
          onChange={handleToggle}
        />
        Enable Captions
      </label>

      <div className="dimension-controls">
        <label>
          Box Width:
          <input
            type="text"
            name="boxDimensions.width"
            value={localPreferences.boxDimensions.width}
            onChange={handleChange}
          />
        </label>
        <label>
          Box Height:
          <input
            type="text"
            name="boxDimensions.height"
            value={localPreferences.boxDimensions.height}
            onChange={handleChange}
          />
        </label>
      </div>

      <button onClick={handleApply}>Apply</button>
    </div>
  );
};

CaptionSettings.propTypes = {
  userPreferences: PropTypes.shape({
    fontStyle: PropTypes.string.isRequired,
    fontSize: PropTypes.string.isRequired,
    fontColor: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    boxDimensions: PropTypes.shape({
      width: PropTypes.string.isRequired,
      height: PropTypes.string.isRequired,
    }).isRequired,
    position: PropTypes.shape({
      top: PropTypes.string.isRequired,
      left: PropTypes.string.isRequired,
    }).isRequired,
    captionsEnabled: PropTypes.bool.isRequired,
  }).isRequired,
  onUpdatePreferences: PropTypes.func.isRequired,
};

export default CaptionSettings;
