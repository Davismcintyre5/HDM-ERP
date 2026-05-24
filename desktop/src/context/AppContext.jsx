import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [legalOpen, setLegalOpen] = useState(null);
  const [legalContent, setLegalContent] = useState('');
  const [contactOpen, setContactOpen] = useState(false);

  const openLegal = (type) => {
    const titleMap = {
      privacy_policy: 'Privacy Policy',
      terms_of_service: 'Terms of Service',
      license_agreement: 'License Agreement',
      cookie_policy: 'Cookie Policy',
    };
    import('../api/public/legalApi').then(({ getLegalDocument }) => {
      getLegalDocument(type).then(({ data }) => {
        setLegalContent(data.data?.content || '');
        setLegalOpen(titleMap[type] || type);
      }).catch(() => {
        setLegalContent('Content not available.');
        setLegalOpen(titleMap[type] || type);
      });
    });
  };

  const closeLegal = () => setLegalOpen(null);
  const openContact = () => setContactOpen(true);
  const closeContact = () => setContactOpen(false);

  return (
    <AppContext.Provider value={{ legalOpen, legalContent, closeLegal, openLegal, contactOpen, openContact, closeContact }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);