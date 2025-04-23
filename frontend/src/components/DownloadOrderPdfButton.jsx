import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import axios from 'axios';

const DownloadOrderPdfButton = ({ orderId }) => {
    const handleDownload = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/orders/${orderId}/pdf`, {
                responseType: 'blob', // important!
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `order_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (error) {
            console.error('Error downloading PDF:', error);
            // Optional: show a Snackbar or Toast for the error
        }
    };

    return (
        <Tooltip title="Download PDF">
            <IconButton onClick={handleDownload} color="primary">
                <PictureAsPdfIcon />
            </IconButton>
        </Tooltip>
    );
};

export default DownloadOrderPdfButton;
