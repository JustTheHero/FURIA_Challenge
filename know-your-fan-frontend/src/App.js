
import React, { useState } from 'react';
import './App.css';
import api from './Api';  

import Header from './components/Header';
import BasicInfoForm from './components/BasicInfoForm';
import PreferencesForm from './components/PreferencesForm';
import DocumentUpload from './components/DocumentUpload';
import SocialConnector from './components/SocialConnector';
import EsportsProfileValidator from './components/EsportsProfileValidator';
import FanProfile from './components/FanProfile';
import FanRewards from './components/FanRewards'; 
import ProgressTracker from './components/ProgressTracker';
import LoginPage from './components/LoginPage';

function App() {
  const [currentView, setCurrentView] = useState('main');
  
  const [activeStep, setActiveStep] = useState(1);
  
  // Estado para armazenar todos os dados do usuário
  const [userData, setUserData] = useState({
    basicInfo: null,
    preferences: null,
    documentVerification: { status: 'pending' },
    socialProfiles: {},
    validatedProfiles: []
  });
  
  // Estado para controlar mensagens de loading e erro
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Função para atualizar dados do usuário
  const updateUserData = (section, data) => {
    setUserData(prevState => ({
      ...prevState,
      [section]: data
    }));
  };
  
  // Função para avançar para a próxima etapa
  const goToNextStep = () => {
    setActiveStep(prevStep => Math.min(prevStep + 1, 7)); 
  };
  
  // Função para voltar para a etapa anterior
  const goToPreviousStep = () => {
    setActiveStep(prevStep => Math.max(prevStep - 1, 1));
  };
  
  // Função para ir para uma etapa específica
  const goToStep = (step) => {
    setActiveStep(step);
  };
  
  // Função para navegar para a tela de recompensas
  const navigateToRewards = () => {
    setActiveStep(7); // Definir a etapa para a tela de recompensas
  };
  
  // Função para alternar para a view de login
  const handleLoginClick = () => {
    setCurrentView('login');
  };
  
  // Função para retornar à view principal
  const handleBackToMain = () => {
    setCurrentView('main');
  };
  
  // Calcular progresso geral
  const calculateProgress = () => {
    const steps = [
      !!userData.basicInfo,
      !!userData.preferences,
      userData.documentVerification.status === 'verified',
      Object.keys(userData.socialProfiles).length > 0,
      userData.validatedProfiles.length > 0
    ];
    
    const completedSteps = steps.filter(step => step).length;
    return (completedSteps / steps.length) * 100;
  };
  
  // Handlers para integração com API
  const handleSaveBasicInfo = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.submitBasicInfo(data);
      if (response.data.success) {
        updateUserData('basicInfo', data);
        goToNextStep();
      } else {
        setError('Falha ao salvar informações básicas.');
      }
    } catch (error) {
      console.error('Erro ao enviar dados básicos:', error);
      setError('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSavePreferences = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.submitPreferences(data);
      if (response.data.success) {
        updateUserData('preferences', data);
        goToNextStep();
      } else {
        setError('Falha ao salvar preferências.');
      }
    } catch (error) {
      console.error('Erro ao enviar preferências:', error);
      setError('Erro ao conectar com o servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDocumentVerification = async (documentData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.verifyDocument(documentData);
      updateUserData('documentVerification', response.data);
      goToNextStep();
    } catch (error) {
      console.error('Erro na verificação do documento:', error);
      setError('Erro ao processar o documento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleConnectSocial = async (platform, profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.connectSocialProfile(platform, 'sample_token');
      if (response.data.status === 'success') {
        const updatedProfiles = {...userData.socialProfiles};
        updatedProfiles[platform] = profileData;
        updateUserData('socialProfiles', updatedProfiles);
        return true;
      } else {
        setError(`Falha ao conectar perfil ${platform}.`);
        return false;
      }
    } catch (error) {
      console.error(`Erro ao conectar perfil ${platform}:`, error);
      setError('Erro ao conectar com a rede social. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const handleValidateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.validateEsportsProfile(profileData.url);
      if (response.data.validated) {
        const updatedProfiles = [...userData.validatedProfiles, profileData];
        updateUserData('validatedProfiles', updatedProfiles);
        return true;
      } else {
        setError(`Falha ao validar perfil ${profileData.platform}.`);
        return false;
      }
    } catch (error) {
      console.error('Erro ao validar perfil:', error);
      setError('Erro ao validar perfil. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.generateFanProfile();
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar perfil:', error);
      setError('Erro ao gerar perfil. Tente novamente.');
      setLoading(false);
      return null;
    }
  };
  
  // Handler para buscar recompensas disponíveis
  const handleFetchRewards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.fetchAvailableRewards(userData);
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar recompensas:', error);
      setError('Erro ao buscar recompensas. Tente novamente.');
      setLoading(false);
      return null;
    }
  };
  
  // Renderizar o componente atual baseado na etapa ativa
  const renderCurrentStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <BasicInfoForm 
            initialData={userData.basicInfo}
            onSave={handleSaveBasicInfo}
            loading={loading}
          />
        );
      case 2:
        return (
          <PreferencesForm 
            initialData={userData.preferences}
            onSave={handleSavePreferences}
            loading={loading}
          />
        );
      case 3:
        return (
          <DocumentUpload 
            onVerificationComplete={handleDocumentVerification}
            loading={loading}
          />
        );
      case 4:
        return (
          <SocialConnector 
            connectedProfiles={userData.socialProfiles}
            onProfileConnected={handleConnectSocial}
            onContinue={goToNextStep}
            loading={loading}
          />
        );
      case 5:
        return (
          <EsportsProfileValidator 
            validatedProfiles={userData.validatedProfiles}
            onProfileValidated={handleValidateProfile}
            onContinue={goToNextStep}
            loading={loading}
          />
        );
      case 6:
        return (
          <FanProfile 
            userData={userData} 
            onGenerate={handleGenerateProfile}
            onNavigateToRewards={navigateToRewards} 
            loading={loading}
          />
        );
      case 7:
        return (
          <FanRewards
            userData={userData}
            onFetchRewards={handleFetchRewards}
            onBackToProfile={() => goToStep(6)}
            loading={loading}
          />
        );
      default:
        return <div>Etapa não encontrada</div>;
    }
  };
  
  if (currentView === 'login') {
    return <LoginPage onBackToMain={handleBackToMain} />;
  }
  
  return (
    <div className="app-container">
      <Header onLoginClick={handleLoginClick} />
      
      <div className="progress-container">
        <ProgressTracker 
          currentStep={activeStep}
          totalSteps={7} 
          progress={calculateProgress()}
          onStepClick={goToStep}
        />
      </div>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      <div className="content-container">
        {renderCurrentStep()}
      </div>
      
      <div className="navigation-buttons">
        {activeStep > 1 && (
          <button 
            className="btn btn-secondary" 
            onClick={goToPreviousStep}
            disabled={loading}
          >
            Voltar
          </button>
        )}
        
        {activeStep < 7 && activeStep !== 1 && activeStep !== 2 && activeStep !== 6 && (
          <button 
            className="btn btn-primary" 
            onClick={goToNextStep}
            disabled={loading}
          >
            Continuar
          </button>
        )}
      </div>
    </div>
  );
}

export default App;