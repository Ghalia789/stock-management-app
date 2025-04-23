import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

const DownloadOrderPdfButton = ({ orderId }) => {
    const handlePreview = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/orders/${orderId}/pdf`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            
            // Open PDF in new tab for preview
            window.open(url, '_blank');
            
            // Optional: Automatically revoke the object URL after some time
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 10000);

        } catch (error) {
            console.error('Error generating PDF:', error);
            // Optional: show a Snackbar or Toast for the error
        }
    };

    const handleDownload = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/orders/${orderId}/pdf`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `order_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Revoke the object URL after download
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 100);

        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Preview PDF">
                <IconButton onClick={handlePreview} color="primary">
                    <PictureAsPdfIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="Download PDF">
                <IconButton onClick={handleDownload} color="primary">
                    <DownloadIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );
};

export default DownloadOrderPdfButton;