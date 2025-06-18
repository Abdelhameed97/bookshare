import React from 'react';
import { Button as BootstrapButton } from 'react-bootstrap';

/**
 * A fully customizable reusable button component.
 * You can pass variant, size, width, color, padding, etc. via className or props.
 */

const CustomButton = ({ children, onClick, className = '', variant = '', ...props }) => {
    return (
        <BootstrapButton
            onClick={onClick}
            className={className}
            variant={variant}
            {...props}
        >
            {children}
        </BootstrapButton>
    );
};

export default CustomButton;
