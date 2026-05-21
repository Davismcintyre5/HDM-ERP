import { useEffect, useState } from 'react';
import { getLegalDocument } from '../../api/public/legalApi';
import Spinner from '../../components/ui/Spinner';

const TermsOfServicePage = () => {
  const [doc, setDoc] = useState(null);
  useEffect(() => { getLegalDocument('terms_of_service').then(({ data }) => setDoc(data.data)).catch(() => {}); }, []);
  if (!doc) return <Spinner />;
  return <div className="max-w-3xl mx-auto p-6"><h1>{doc.title}</h1><div dangerouslySetInnerHTML={{ __html: doc.content }} /></div>;
};
export default TermsOfServicePage;