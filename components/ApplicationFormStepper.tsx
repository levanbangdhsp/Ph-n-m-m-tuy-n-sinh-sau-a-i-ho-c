import React from 'react';
import CheckCircleIcon from './icons/CheckCircleIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import PencilIcon from './icons/PencilIcon';
import StepperArrowIcon from './icons/StepperArrowIcon';

interface Step { 
  step: number; 
  title: string; 
}

interface ApplicationFormStepperProps {
  steps: Step[];
  currentStep: number;
  erroredSteps: Set<number>;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
  isUpdateMode: boolean;
}

const ApplicationFormStepper: React.FC<ApplicationFormStepperProps> = ({ steps, currentStep, erroredSteps, completedSteps, onStepClick, isUpdateMode }) => {
  
  return (
    <nav className="mb-12" aria-label="Hồ sơ tiến trình">
      <div className="overflow-x-auto pb-4 -mx-8 px-8">
        <ol role="list" className="flex items-start">
          {steps.map((step, index) => {
            const hasError = erroredSteps.has(step.step);
            const isActive = step.step === currentStep;
            const isCompleted = completedSteps.has(step.step) && !isActive; 

            const canNavigate = isUpdateMode || isCompleted || completedSteps.has(step.step - 1) || step.step === 1;
            const connectorIsActive = isCompleted || isActive || hasError || currentStep > step.step;

            return (
              <li key={step.step} className="relative flex-1 last:flex-none">
                {/* Connector Arrow - Updated positioning for perfect alignment */}
                {index > 0 && (
                  <div className="absolute top-5 left-[-50%] w-full h-4 transform -translate-y-1/2" aria-hidden="true">
                    <StepperArrowIcon className={`w-full h-full ${connectorIsActive ? 'text-sky-600' : 'text-gray-200'}`} />
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => canNavigate && onStepClick(step.step)}
                  className={`relative z-10 flex flex-col items-center gap-2 transition-transform duration-200 group ${canNavigate ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`}
                  aria-current={isActive ? 'step' : undefined}
                  disabled={!canNavigate}
                >
                  {/* Circle */}
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-200 bg-white
                    ${
                      hasError ? 'border-red-600' : 
                      isCompleted ? `border-sky-600 !bg-sky-600` : 
                      isActive ? 'border-sky-600 !bg-sky-50 ring-4 ring-sky-200' : 
                      'border-gray-300 group-hover:border-sky-500'
                    }`
                  }>
                    {hasError ? <ExclamationTriangleIcon className="h-5 w-5 text-red-600" /> :
                     isCompleted ? <CheckCircleIcon className="h-6 w-6 text-white" /> :
                     isActive && completedSteps.has(step.step) ? <PencilIcon className="h-5 w-5 text-sky-600" /> :
                     <span className={`font-bold ${isActive ? 'text-sky-600' : 'text-gray-500 group-hover:text-sky-600'}`}>{step.step}</span>
                    }
                  </span>
                  {/* Label */}
                  <span className={`text-xs text-center font-semibold w-28 break-words transition-colors duration-200 bg-white px-1 rounded
                    ${hasError ? 'text-red-600' :
                      isActive ? 'text-sky-600' :
                      'text-gray-500 group-hover:text-sky-600'}`
                  }>
                    {step.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default ApplicationFormStepper;