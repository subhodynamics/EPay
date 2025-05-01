import React from 'react';

interface DateTimeFormatterProps {
    isoString?: string; // Make isoString optional
    display: 'date' | 'time' | 'both';
}

const DateTimeFormatter: React.FC<DateTimeFormatterProps> = ({ isoString, display }) => {
    // Check if isoString is valid
    const isValidDate = isoString && !isNaN(Date.parse(isoString));

    if (!isValidDate) {
        return <span>NA</span>;
    }

    const date = new Date(isoString);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    return (
        <span>
            {display === 'date' ? formattedDate : null}
            {display === 'time' ? formattedTime : null}
            {display === 'both' ? `${formattedDate} ${formattedTime}` : null}
        </span>
    );
};

export default DateTimeFormatter;
