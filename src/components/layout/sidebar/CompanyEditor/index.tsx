
import { Company, UrgencyLevel } from "@/types";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { InformationTab } from "./InformationTab";
import { EmailsTab } from "./EmailsTab";
import { PhonesTab } from "./PhonesTab";
import { ContactsTab } from "./ContactsTab";
import { InProgressTab } from "./InProgressTab";

interface CompanyEditorProps {
  company: Company;
  form: UseFormReturn<{
    name: string;
    jobPosition: string;
    urgency: UrgencyLevel;
    inProgress: string;
  }>;
  isOpen: boolean;
  onClose: () => void;
  availableJobPositions: string[];
  customJobPosition: string;
  setCustomJobPosition: (value: string) => void;
  handleJobPositionChange: (value: string) => void;
  applyCustomJobPosition: () => void;
  onSave: () => void;
  // Email related props
  newEmail: string;
  setNewEmail: (value: string) => void;
  newJobPosition: string;
  setNewJobPosition: (value: string) => void;
  newUrgency: UrgencyLevel;
  setNewUrgency: (value: UrgencyLevel) => void;
  onAddEmail: () => void;
  onDeleteEmail: (emailId: string) => void;
  // Phone related props
  newPhone: string;
  setNewPhone: (value: string) => void;
  onAddPhone: () => void;
  onDeletePhone: (phoneId: string) => void;
  // Contact related props
  newContact: string;
  setNewContact: (value: string) => void;
  onAddContact: () => void;
  onDeleteContact: (contactId: string) => void;
  // InProgress related props
  newInProgressState: string;
  setNewInProgressState: (value: string) => void;
  onAddInProgressState: () => void;
  onDeleteInProgressState: (stateId: string) => void;
}

export function CompanyEditor({
  company,
  form,
  isOpen,
  onClose,
  availableJobPositions,
  customJobPosition,
  setCustomJobPosition,
  handleJobPositionChange,
  applyCustomJobPosition,
  onSave,
  newEmail,
  setNewEmail,
  newJobPosition,
  setNewJobPosition,
  newUrgency,
  setNewUrgency,
  onAddEmail,
  onDeleteEmail,
  newPhone,
  setNewPhone,
  onAddPhone,
  onDeletePhone,
  newContact,
  setNewContact,
  onAddContact,
  onDeleteContact,
  newInProgressState,
  setNewInProgressState,
  onAddInProgressState,
  onDeleteInProgressState,
}: CompanyEditorProps) {
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md bg-background z-50">
        <DialogHeader>
          <DialogTitle>Editar empresa</DialogTitle>
        </DialogHeader>
        
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
              availableJobPositions={availableJobPositions}
              newEmail={newEmail}
              setNewEmail={setNewEmail}
              newJobPosition={newJobPosition}
              setNewJobPosition={setNewJobPosition}
              newUrgency={newUrgency}
              setNewUrgency={setNewUrgency}
              onAddEmail={onAddEmail}
              onDeleteEmail={onDeleteEmail}
            />
          </TabsContent>
          
          <TabsContent value="phones" className="pt-4">
            <PhonesTab
              company={company}
              newPhone={newPhone}
              setNewPhone={setNewPhone}
              onAddPhone={onAddPhone}
              onDeletePhone={onDeletePhone}
            />
          </TabsContent>
          
          <TabsContent value="contacts" className="pt-4">
            <ContactsTab
              company={company}
              newContact={newContact}
              setNewContact={setNewContact}
              onAddContact={onAddContact}
              onDeleteContact={onDeleteContact}
            />
          </TabsContent>
          
          <TabsContent value="inprogress" className="pt-4">
            <InProgressTab
              company={company}
              newInProgressState={newInProgressState}
              setNewInProgressState={setNewInProgressState}
              onAddInProgressState={onAddInProgressState}
              onDeleteInProgressState={onDeleteInProgressState}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
