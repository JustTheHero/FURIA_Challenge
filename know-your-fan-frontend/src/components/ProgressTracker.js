import React from 'react';
import './ProgressTracker.css';

/**
 * Componente que mostra o progresso do usuário nas etapas de criação do perfil
 * 
 * @param {Object} props - Propriedades do componente
 * @param {number} props.currentStep - A etapa atual (1-6)
 * @param {number} props.totalSteps - Total de etapas no processo
 * @param {number} props.progress - Porcentagem de progresso geral (0-100)
 * @param {Function} props.onStepClick - Função chamada quando uma etapa é clicada
 */
const ProgressTracker = ({ currentStep, totalSteps, progress, onStepClick }) => {
  const stepNames = [
    "Informações Básicas",
    "Preferências",
    "Verificação de Documentos",
    "Conexão Social",
    "Perfil eSports",
    "Perfil Completo"
  ];

  // Verifica se a etapa está completa, atual ou futura
  const getStepStatus = (stepIndex) => {
    if (stepIndex + 1 < currentStep) return "completed";
    if (stepIndex + 1 === currentStep) return "current";
    return "pending";
  };

  return (
    <div className="progress-tracker">
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
          role="progressbar"
        ></div>
      </div>
      
      <div className="steps-container">
        {stepNames.map((name, index) => (
          <div 
            key={index} 
            className={`step-item ${getStepStatus(index)}`}
            onClick={() => {
              // Só permite navegação para etapas já visitadas
              if (index + 1 <= currentStep) {
                onStepClick(index + 1);
              }
            }}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-name">{name}</div>
          </div>
        ))}
      </div>
      
      <div className="progress-info">
        <span className="progress-percentage">{Math.round(progress)}% completo</span>
        <span className="steps-counter">Etapa {currentStep} de {totalSteps}</span>
      </div>
    </div>
  );
};

export default ProgressTracker;