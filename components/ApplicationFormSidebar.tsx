import React from 'react';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';

interface Section {
  id: string;
  title: string;
}

interface ApplicationFormSidebarProps {
  sections: Section[];
  activeSectionId: string;
  erroredSectionIds: Set<string>;
  onSectionClick: (id: string) => void;
}

const ApplicationFormSidebar: React.FC<ApplicationFormSidebarProps> = ({ sections, activeSectionId, erroredSectionIds, onSectionClick }) => {
  return (
    <aside className="hidden lg:block">
      <nav className="sticky top-24 space-y-2">
        <h3 className="px-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">Nội dung hồ sơ</h3>
        {sections.map(section => {
          const isActive = section.id === activeSectionId;
          const hasError = erroredSectionIds.has(section.id);
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => {
                e.preventDefault();
                onSectionClick(section.id);
              }}
              className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-sky-100 text-sky-700'
                  : hasError
                  ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className={hasError && !isActive ? 'font-semibold' : ''}>{section.title}</span>
              {hasError && !isActive && <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />}
            </a>
          );
        })}
      </nav>
    </aside>
  );
};

export default ApplicationFormSidebar;
