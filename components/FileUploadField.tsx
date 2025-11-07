import React, { useState, useRef } from 'react';
import { User } from '../types';
import { SCRIPT_URL } from '../constants';
import UploadIcon from './icons/UploadIcon';
import TrashIcon from './icons/TrashIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import CheckCircleSolidIcon from './icons/CheckCircleSolidIcon';
import ExclamationCircleSolidIcon from './icons/ExclamationCircleSolidIcon';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface FileUploadFieldProps {
  user: User;
  label: string;
  description: string;
  targetFileName: string; // e.g., "AnhThe"
  linkColumnHeader: string; // e.g., "Link Ảnh thẻ"
  value: string; // The URL of the uploaded file
  onUploadComplete: (url: string) => void;
  onDelete: () => void;
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  user,
  label,
  description,
  targetFileName,
  linkColumnHeader,
  value,
  onUploadComplete,
  onDelete,
  acceptedFileTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  maxFileSizeMB = 5,
}) => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUrlWithCacheBuster = () => `${SCRIPT_URL}?v=${new Date().getTime()}`;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setErrorMessage(`Lỗi: Tệp không được vượt quá ${maxFileSizeMB}MB.`);
      setStatus('error');
      return;
    }
    if (!acceptedFileTypes.includes(file.type)) {
      setErrorMessage(`Lỗi: Định dạng tệp không hợp lệ. Chỉ chấp nhận: ${acceptedFileTypes.join(', ')}.`);
      setStatus('error');
      return;
    }

    setFileName(file.name);
    uploadFile(file);
  };

  const uploadFile = (file: File) => {
    setStatus('uploading');
    setErrorMessage('');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const fileData = reader.result as string;
      const fileExtension = file.name.split('.').pop() || 'tmp';
      const newFileName = `${targetFileName}_${user.id}.${fileExtension}`;

      const payload = {
        action: 'uploadFile',
        email: user.email,
        fileData,
        mimeType: file.type,
        fileName: newFileName,
        applicantId: user.id,
        applicantName: user.fullName,
        linkColumnHeader: linkColumnHeader,
      };

      try {
        const response = await fetch(getUrlWithCacheBuster(), {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
          redirect: 'follow',
        });

        const result = await response.json();
        if (result.success) {
          setStatus('success');
          onUploadComplete(result.fileUrl);
        } else {
          setStatus('error');
          setErrorMessage(result.message || 'Lỗi không xác định từ máy chủ.');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('Lỗi kết nối. Vui lòng kiểm tra mạng và thử lại.');
        console.error('Upload error:', error);
      }
    };
    reader.onerror = () => {
        setStatus('error');
        setErrorMessage('Không thể đọc tệp tin.');
    };
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleViewFile = () => {
      if(value) window.open(value, '_blank', 'noopener,noreferrer');
  }

  const handleDelete = () => {
    // Reset internal state before calling the parent's onDelete handler
    setStatus('idle');
    setErrorMessage('');
    setFileName('');
    onDelete();
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex-grow mb-4 md:mb-0">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
            {value ? (
                 <>
                    <button type="button" onClick={handleViewFile} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors">
                        Xem file
                    </button>
                    <button type="button" onClick={handleDelete} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </>
            ) : (
                <button
                    type="button"
                    onClick={triggerFileSelect}
                    disabled={status === 'uploading'}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-wait transition-colors"
                >
                    <UploadIcon className="w-5 h-5" />
                    <span>Chọn file</span>
                </button>
            )}
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept={acceptedFileTypes.join(',')}
            />
        </div>
      </div>
      
      {(status === 'uploading' || status === 'error' || status === 'success') && !value && (
         <div className="mt-3 p-2 bg-white border rounded-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm truncate">
                    {status === 'uploading' && <SpinnerIcon className="w-5 h-5 flex-shrink-0" />}
                    {status === 'success' && <CheckCircleSolidIcon className="w-5 h-5 text-green-500 flex-shrink-0" />}
                    {status === 'error' && <ExclamationCircleSolidIcon className="w-5 h-5 text-red-500 flex-shrink-0" />}
                    <span className="text-gray-700 truncate">{fileName || '...'}</span>
                </div>
                 <span className={`text-sm font-medium ${
                     status === 'uploading' ? 'text-gray-500' :
                     status === 'success' ? 'text-green-600' :
                     'text-red-600'
                 }`}>
                     {status === 'uploading' && 'Đang tải lên...'}
                     {status === 'success' && 'Thành công'}
                     {status === 'error' && 'Thất bại'}
                 </span>
            </div>
            {status === 'error' && errorMessage && (
                <p className="text-xs text-red-600 mt-1 pl-7">{errorMessage}</p>
            )}
         </div>
      )}

    </div>
  );
};

export default FileUploadField;