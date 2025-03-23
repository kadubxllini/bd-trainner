
import { Company } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { InformationTab } from "./InformationTab";
import { EmailsTab } from "./EmailsTab";
import { PhonesTab } from "./PhonesTab";
import { ContactsTab } from "./ContactsTab";
import { InProgressTab } from "./InProgressTab";

interface CompanyEditorProps {
  company: Company;
  availableJobPositions: string[];
  availableInProgressStates: string[];
  
  // Form state
  customJobPosition: string;
  setCustomJobPosition: (value: string) => void;
  handleJobPositionChange: (value: string) => void;
  applyCustomJobPosition: () => void;
  
  // Email state
  newEmail: string;
  setNewEmail: (value: string) => void;
  newJobPosition: string;
  setNewJobPosition: (value: string) => void;
  newUrgency: any;
  setNewUrgency: (value: any) => void;
  onAddEmail: () => void;
  deleteCompanyEmail: (emailId: string) => Promise<void>;
  
  // Phone state
  newPhone: string;
  setNewPhone: (value: string) => void;
  onAddPhone: () => void;
  deleteCompanyPhone: (phoneId: string) => Promise<void>;
  
  // Contact state
  newContact: string;
  setNewContact: (value: string) => void;
  onAddContact: () => void;
  deleteCompanyContact: (contactId: string) => Promise<void>;
  
  // In Progress state
  newInProgressState: string;
  setNewInProgressState: (value: string) => void;
  onAddInProgressState: () => void;
  deleteCompanyInProgressState: (stateId: string) => void;
  
  // Actions
  onSave: () => void;
  onClose: () => void;
}

export function CompanyEditor({
  company,
  availableJobPositions,
  availableInProgressStates,
  
  // Form state
  customJobPosition,
  setCustomJobPosition,
  handleJobPositionChange,
  applyCustomJobPosition,
  
  // Email state
  newEmail,
  setNewEmail,
  newJobPosition,
  setNewJobPosition,
  newUrgency,
  setNewUrgency,
  onAddEmail,
  deleteCompanyEmail,
  
  // Phone state
  newPhone,
  setNewPhone,
  onAddPhone,
  deleteCompanyPhone,
  
  // Contact state
  newContact,
  setNewContact,
  onAddContact,
  deleteCompanyContact,
  
  // In Progress state
  newInProgressState,
  setNewInProgressState,
  onAddInProgressState,
  deleteCompanyInProgressState,
  
  // Actions
  onSave,
  onClose
}: CompanyEditorProps) {
  const form = useForm({
    defaultValues: {
      name: company.name,
      jobPositions: company.jobPositions || [],
      urgency: company.urgency || 'Média',
      inProgress: company.inProgress || ''
    }
  });
  
  return (
    <Tabs defaultValue="info" className="pt-2">
      <TabsList className="w-full">
        <TabsTrigger value="info" className="flex-1">Informações</TabsTrigger>
        <TabsTrigger value="emails" className="flex-1">E-mails</TabsTrigger>
        <TabsTrigger value="phones" className="flex-1">Telefones</TabsTrigger>
        <TabsTrigger value="contacts" className="flex-1">Contatos</TabsTrigger>
        <TabsTrigger value="inprogress" className="flex-1">Decorrer</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info" className="pt-4">
        <InformationTab
          form={form}
          availableJobPositions={availableJobPositions}
          customJobPosition={customJobPosition}
          setCustomJobPosition={setCustomJobPosition}
          handleJobPositionChange={handleJobPositionChange}
          applyCustomJobPosition={applyCustomJobPosition}
          onSave={onSave}
        />
      </TabsContent>
      
      <TabsContent value="emails" className="pt-4">
        <EmailsTab
          company={company}
          newEmail={newEmail}
          setNewEmail={setNewEmail}
          newJobPosition={newJobPosition}
          setNewJobPosition={setNewJobPosition}
          newUrgency={newUrgency}
          setNewUrgency={setNewUrgency}
          onAddEmail={onAddEmail}
          onDeleteEmail={deleteCompanyEmail}
        />
      </TabsContent>
      
      <TabsContent value="phones" className="pt-4">
        <PhonesTab
          company={company}
          newPhone={newPhone}
          setNewPhone={setNewPhone}
          onAddPhone={onAddPhone}
          onDeletePhone={deleteCompanyPhone}
        />
      </TabsContent>
      
      <TabsContent value="contacts" className="pt-4">
        <ContactsTab
          company={company}
          newContact={newContact}
          setNewContact={setNewContact}
          onAddContact={onAddContact}
          onDeleteContact={deleteCompanyContact}
        />
      </TabsContent>
      
      <TabsContent value="inprogress" className="pt-4">
        <InProgressTab
          company={company}
          newInProgressState={newInProgressState}
          setNewInProgressState={setNewInProgressState}
          onAddInProgressState={onAddInProgressState}
          onDeleteInProgressState={deleteCompanyInProgressState}
        />
      </TabsContent>
    </Tabs>
  );
}
