// DocumentUpload.js - Componente para upload e verificação de documentos
import React, { useState } from 'react';
import './DocumentUpload.css';

function DocumentUpload({ onVerificationComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Função para lidar com a seleção de arquivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setErrorMessage(null);
      
      // Criar URL para preview da imagem
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para iniciar o processo de verificação do documento
  const handleVerification = async () => {
    if (!selectedFile) {
      setErrorMessage("Por favor, selecione um documento para verificação.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const verificationResult = {
        status: Math.random() > 0.2 ? "verified" : "rejected", 
        match_score: Math.random() * 0.3 + 0.7, 
        validity_score: Math.random() * 0.3 + 0.7, 
        verification_date: new Date().toISOString()
      };
      
      setVerificationStatus(verificationResult);
      
      // Notificar o componente pai sobre a conclusão da verificação
      onVerificationComplete(verificationResult);
    } catch (error) {
      setErrorMessage("Ocorreu um erro durante a verificação do documento. Por favor, tente novamente.");
      console.error("Erro na verificação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para reiniciar o processo de verificação
  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setVerificationStatus(null);
    setErrorMessage(null);
  };

  return (
    <div className="document-upload-container">
      <h2>Verificação de Documento</h2>
      <p className="instructions">
        Por favor, envie uma foto clara do seu documento de identidade (RG, CNH ou Passaporte) para verificação.
        A verificação de documento é necessária para confirmar sua identidade.
      </p>

      {!verificationStatus && (
        <div className="upload-section">
          <div className="file-input-container">
            <input 
              type="file" 
              id="document-upload" 
              accept="image/*" 
              onChange={handleFileSelect}
              className="file-input"
            />
            <label htmlFor="document-upload" className="file-input-label">
              {selectedFile ? selectedFile.name : "Escolher arquivo"}
            </label>
          </div>
          
          {previewUrl && (
            <div className="document-preview">
              <h3>Preview do Documento</h3>
              <img src={previewUrl} alt="Preview do documento" />
            </div>
          )}
          
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          
          <div className="button-container">
            <button 
              className="btn btn-primary" 
              onClick={handleVerification} 
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? "Verificando..." : "Verificar Documento"}
            </button>
            
            {selectedFile && (
              <button className="btn btn-secondary" onClick={handleReset}>
                Limpar
              </button>
            )}
          </div>
        </div>
      )}

      {verificationStatus && (
        <div className={`verification-result ${verificationStatus.status}`}>
          <h3>Resultado da Verificação</h3>
          <div className="result-icon">
            {verificationStatus.status === "verified" ? "✅" : "❌"}
          </div>
          <p className="status-message">
            {verificationStatus.status === "verified" 
              ? "Documento verificado com sucesso!" 
              : "Falha na verificação do documento."}
          </p>
          
          {verificationStatus.status === "verified" ? (
            <div className="verification-details">
              <p>Pontuação de correspondência: {Math.round(verificationStatus.match_score * 100)}%</p>
              <p>Pontuação de validade: {Math.round(verificationStatus.validity_score * 100)}%</p>
              <p>Data de verificação: {new Date(verificationStatus.verification_date).toLocaleString()}</p>
            </div>
          ) : (
            <div className="failure-message">
              <p>Seu documento não pôde ser verificado. Possíveis motivos:</p>
              <ul>
                <li>A imagem não está clara o suficiente</li>
                <li>O documento está expirado ou inválido</li>
                <li>As informações não correspondem aos dados informados</li>
              </ul>
              <button className="btn btn-primary" onClick={handleReset}>
                Tentar Novamente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;