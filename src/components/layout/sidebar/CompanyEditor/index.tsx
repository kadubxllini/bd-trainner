
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Company, UrgencyLevel } from "@/types";
import { InformationTab } from "./InformationTab";
import { EmailsTab } from "./EmailsTab";
import { PhonesTab } from "./PhonesTab";
import { ContactsTab } from "./ContactsTab";
import { InProgressTab } from "./InProgressTab";
import { useForm } from "react-hook-form";
import { useMessages } from "@/context/MessageContext";

interface CompanyEditorProps {
  company: Company;
  onClose: () => void;
}

export function CompanyEditor({ company, onClose }: CompanyEditorProps) {
  const { 
    updateCompany, 
    addCompanyEmail, 
    deleteCompanyEmail, 
    addCompanyPhone, 
    deleteCompanyPhone, 
    addCompanyContact, 
    deleteCompanyContact,
    availableJobPositions,
    addJobPosition,
    availableInProgressStates,
    addCompanyInProgressState,
    deleteCompanyInProgressState
  } = useMessages();
  
  const [customJobPosition, setCustomJobPosition] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newJobPosition, setNewJobPosition] = useState('');
  const [newUrgency, setNewUrgency] = useState<UrgencyLevel>('Média');
  const [newPhone, setNewPhone] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newInProgressState, setNewInProgressState] = useState('');
  
  const form = useForm({
    defaultValues: {
      name: company.name,
      jobPositions: company.jobPositions || [],
      urgency: company.urgency || 'Média',
      inProgress: company.inProgress || ''
    }
  });
  
  const handleSaveCompany = () => {
    const { name, jobPositions, urgency, inProgress } = form.getValues();
    
    updateCompany(company.id, {
      name: name,
      jobPositions: jobPositions,
      urgency: urgency,
      inProgress: inProgress
    });
    
    onClose();
  };
  
  const handleAddEmail = () => {
    if (newEmail.trim()) {
      addCompanyEmail(company.id, newEmail, newJobPosition, newUrgency);
      setNewEmail('');
      setNewJobPosition('');
      setNewUrgency('Média');
    }
  };
  
  const handleAddPhone = () => {
    if (newPhone.trim()) {
      addCompanyPhone(company.id, newPhone);
      setNewPhone('');
    }
  };
  
  const handleAddContact = () => {
    if (newContact.trim()) {
      addCompanyContact(company.id, newContact);
      setNewContact('');
    }
  };
  
  const handleAddInProgressState = () => {
    if (newInProgressState.trim()) {
      addCompanyInProgressState(company.id, newInProgressState);
      setNewInProgressState('');
    }
  };
  
  const handleJobPositionChange = (value: string) => {
    if (value === 'custom') {
      setCustomJobPosition('');
    }
  };
  
  const applyCustomJobPosition = () => {
    if (customJobPosition && customJobPosition.trim()) {
      addJobPosition(customJobPosition);
      setCustomJobPosition('');
    }
  };
  
  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList className="w-full mb-4">
        <TabsTrigger value="info" className="flex-1">Informações</TabsTrigger>
        <TabsTrigger value="emails" className="flex-1">E-mails</TabsTrigger>
        <TabsTrigger value="phones" className="flex-1">Telefones</TabsTrigger>
        <TabsTrigger value="contacts" className="flex-1">Contatos</TabsTrigger>
        <TabsTrigger value="inprogress" className="flex-1">Decorrer</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info">
        <InformationTab 
          form={form}
          availableJobPositions={availableJobPositions}
          customJobPosition={customJobPosition}
          setCustomJobPosition={setCustomJobPosition}
          handleJobPositionChange={handleJobPositionChange}
          applyCustomJobPosition={applyCustomJobPosition}
          onSave={handleSaveCompany}
        />
      </TabsContent>
      
      <TabsContent value="emails">
        <EmailsTab 
          company={company}
          newEmail={newEmail}
          setNewEmail={setNewEmail}
          newJobPosition={newJobPosition}
          setNewJobPosition={setNewJobPosition}
          newUrgency={newUrgency}
          setNewUrgency={setNewUrgency}
          availableJobPositions={availableJobPositions}
          handleAddEmail={handleAddEmail}
          deleteCompanyEmail={deleteCompanyEmail}
        />
      </TabsContent>
      
      <TabsContent value="phones">
        <PhonesTab 
          company={company}
          newPhone={newPhone}
          setNewPhone={setNewPhone}
          handleAddPhone={handleAddPhone}
          deleteCompanyPhone={deleteCompanyPhone}
        />
      </TabsContent>
      
      <TabsContent value="contacts">
        <ContactsTab 
          company={company}
          newContact={newContact}
          setNewContact={setNewContact}
          handleAddContact={handleAddContact}
          deleteCompanyContact={deleteCompanyContact}
        />
      </TabsContent>
      
      <TabsContent value="inprogress">
        <InProgressTab 
          company={company}
          newInProgressState={newInProgressState}
          setNewInProgressState={setNewInProgressState}
          availableInProgressStates={availableInProgressStates}
          handleAddInProgressState={handleAddInProgressState}
          deleteCompanyInProgressState={deleteCompanyInProgressState}
        />
      </TabsContent>
    </Tabs>
  );
}
