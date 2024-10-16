import React from 'react';
import PropTypes from 'prop-types';
import './Caption.css';

const Caption = ({ text, isCaptionVisible, userPreferences }) => {
  return (
    isCaptionVisible && (
      <div
        className="caption-box"
        style={{
          fontFamily: userPreferences.fontStyle,
          fontSize: userPreferences.fontSize,
          color: userPreferences.fontColor,
          backgroundColor: userPreferences.backgroundColor,
          width: userPreferences.boxDimensions.width,
          height: userPreferences.boxDimensions.height,
          position: 'absolute',
          top: userPreferences.position.top,
          left: userPreferences.position.left,
          transform: 'translate(-50%, -50%)', // Center the caption
        }}
      >
        {text}
      </div>
    )
  );
};

Caption.propTypes = {
  text: PropTypes.string.isRequired,
  isCaptionVisible: PropTypes.bool.isRequired,
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
  }).isRequired,
};

export default Caption;
