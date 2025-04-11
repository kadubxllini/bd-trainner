
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Company, UrgencyLevel } from '@/types';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, CheckCircle, Loader2 } from 'lucide-react';
import { InformationTab } from './InformationTab';
import { EmailsTab } from './EmailsTab';
import { PhonesTab } from './PhonesTab';
import { ContactsTab } from './ContactsTab';
import { useMessages } from '@/context/hooks/useMessageContext';

interface CompanyEditDialogProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyEditDialog({ company, isOpen, onClose }: CompanyEditDialogProps) {
  const { 
    updateCompany, 
    addCompanyEmail, 
    deleteCompanyEmail,
    addCompanyPhone,
    deleteCompanyPhone,
    addCompanyContact,
    deleteCompanyContact,
    availableJobPositions
  } = useMessages();
  
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("information");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newContact, setNewContact] = useState("");
  
  const form = useForm({
    defaultValues: {
      name: company?.name || '',
      jobPositions: company?.jobPositions || [],
      urgency: company?.urgency || 'Baixa' as UrgencyLevel,
      inProgress: company?.inProgress || '',
      selector: company?.selector || ''
    }
  });
  
  React.useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        jobPositions: company.jobPositions || [],
        urgency: company.urgency || 'Baixa',
        inProgress: company.inProgress || '',
        selector: company.selector || ''
      });
      
      setActiveTab("information");
      setNewEmail("");
      setNewPhone("");
      setNewContact("");
    }
  }, [company, form.reset]);
  
  const handleSave = async () => {
    if (!company) return;
    
    try {
      setIsSaving(true);
      await updateCompany(company.id, form.getValues());
      onClose();
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddEmail = async () => {
    if (!company || !newEmail.trim()) return;
    
    try {
      await addCompanyEmail(company.id, newEmail);
      setNewEmail("");
    } catch (error) {
      console.error("Erro ao adicionar email:", error);
    }
  };
  
  const handleDeleteEmail = async (emailId: string) => {
    try {
      await deleteCompanyEmail(emailId);
    } catch (error) {
      console.error("Erro ao remover email:", error);
    }
  };
  
  const handleAddPhone = async () => {
    if (!company || !newPhone.trim()) return;
    
    try {
      await addCompanyPhone(company.id, newPhone);
      setNewPhone("");
    } catch (error) {
      console.error("Erro ao adicionar telefone:", error);
    }
  };
  
  const handleDeletePhone = async (phoneId: string) => {
    try {
      await deleteCompanyPhone(phoneId);
    } catch (error) {
      console.error("Erro ao remover telefone:", error);
    }
  };
  
  const handleAddContact = async () => {
    if (!company || !newContact.trim()) return;
    
    try {
      await addCompanyContact(company.id, newContact);
      setNewContact("");
    } catch (error) {
      console.error("Erro ao adicionar contato:", error);
    }
  };
  
  const handleDeleteContact = async (contactId: string) => {
    try {
      await deleteCompanyContact(contactId);
    } catch (error) {
      console.error("Erro ao remover contato:", error);
    }
  };
  
  if (!company) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Editar Empresa
          </DialogTitle>
          <DialogDescription>
            Edite as informações da empresa {company.name}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="information">Informações</TabsTrigger>
            <TabsTrigger value="emails">E-mails</TabsTrigger>
            <TabsTrigger value="phones">Telefones</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="information" className="mt-0">
            <InformationTab 
              form={form} 
              company={company} 
              availableJobPositions={availableJobPositions}
              onSave={handleSave}
            />
          </TabsContent>
          
          <TabsContent value="emails" className="mt-0">
            <EmailsTab 
              company={company} 
              newEmail={newEmail}
              setNewEmail={setNewEmail}
              onAddEmail={handleAddEmail}
              onDeleteEmail={handleDeleteEmail}
            />
          </TabsContent>
          
          <TabsContent value="phones" className="mt-0">
            <PhonesTab 
              company={company}
              newPhone={newPhone}
              setNewPhone={setNewPhone}
              onAddPhone={handleAddPhone}
              onDeletePhone={handleDeletePhone}
            />
          </TabsContent>
          
          <TabsContent value="contacts" className="mt-0">
            <ContactsTab 
              company={company}
              newContact={newContact}
              setNewContact={setNewContact}
              onAddContact={handleAddContact}
              onDeleteContact={handleDeleteContact}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
