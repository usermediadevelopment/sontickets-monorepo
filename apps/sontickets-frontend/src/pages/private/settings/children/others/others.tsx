// I'm going to create a view to integrate with google ADS, I need to create a sidebar with the following options using chakra ui, the options are:
// - Google Ads
// - Meta Ads

import {
  Flex,
  Heading,
  Text,
  useColorModeValue,
  Container,
  Box,
  VStack,
  FormControl,
  FormLabel,
  Switch,
  Card,
  CardBody,
  CardHeader,
  Divider,
  useToast,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  HStack,
  SimpleGrid,
  Select,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '~/hooks/useAuth';
import { CompanyOthersConfig, Form, FormField, FormFieldType } from '~/core/types';
import firebaseFirestore from '~/config/firebase/firestore';
import { collection, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';

interface DefaultFormValues {
  [key: string]: string | number;
}

const Integrations = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();
  const { user, updateUser } = useAuth();

  // State for the switches
  const [isSourceReportsActive, setIsSourceReportsActive] = useState(false);
  const [isAutopopulateEnabled, setIsAutopopulateEnabled] = useState(false);
  const [isSavingDefaults, setIsSavingDefaults] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(true);
  const [isLoadingCompanySettings, setIsLoadingCompanySettings] = useState(true);
  const [isSavingCompanySettings, setIsSavingCompanySettings] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [currentForm, setCurrentForm] = useState<Form | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<DefaultFormValues>();

  // Apply saved default values to form after form fields are loaded
  const applyDefaultValuesToForm = async () => {
    if (!user?.company?.id) return;

    try {
      // Load from localStorage first
      const currentUserData = localStorage.getItem('user');
      if (currentUserData) {
        try {
          const userPartial = JSON.parse(currentUserData);
          const othersConfig = userPartial.company?.others as CompanyOthersConfig;

          if (othersConfig?.populateForm?.fields) {
            Object.entries(othersConfig.populateForm.fields).forEach(([key, value]) => {
              setValue(`default_${key}`, value);
            });
          }
        } catch (error) {
          console.error('Error applying localStorage default values:', error);
        }
      }

      // Then load from Firestore to ensure we have the latest data
      const companyDoc = await getDoc(doc(firebaseFirestore, 'companies', user.company.id));
      if (companyDoc.exists()) {
        const companyData = companyDoc.data();
        const othersConfig = companyData.others as CompanyOthersConfig;

        if (othersConfig?.populateForm?.fields) {
          Object.entries(othersConfig.populateForm.fields).forEach(([key, value]) => {
            setValue(`default_${key}`, value);
          });
        }
      }
    } catch (error) {
      console.error('Error applying default values to form:', error);
    }
  };

  // Load company settings
  const loadCompanySettings = async () => {
    if (!user?.company?.id) return;

    setIsLoadingCompanySettings(true);
    try {
      // First try to load from localStorage for faster UI update
      const currentUserData = localStorage.getItem('user');
      if (currentUserData) {
        try {
          const userPartial = JSON.parse(currentUserData);
          const othersConfig = userPartial.company?.others as CompanyOthersConfig;

          if (othersConfig) {
            setIsSourceReportsActive(othersConfig.isSourceActive || false);
            setIsAutopopulateEnabled(othersConfig.populateForm?.isActive || false);

            // Set default values in form if they exist
            if (othersConfig.populateForm?.fields) {
              Object.entries(othersConfig.populateForm.fields).forEach(([key, value]) => {
                setValue(`default_${key}`, value);
              });
            }
          }
        } catch (error) {
          console.error('Error parsing localStorage user data:', error);
        }
      }

      // Then load from Firestore to ensure we have the latest data
      const companyDoc = await getDoc(doc(firebaseFirestore, 'companies', user.company.id));
      if (companyDoc.exists()) {
        const companyData = companyDoc.data();
        const othersConfig = companyData.others as CompanyOthersConfig;

        if (othersConfig) {
          setIsSourceReportsActive(othersConfig.isSourceActive || false);
          setIsAutopopulateEnabled(othersConfig.populateForm?.isActive || false);

          // Set default values in form if they exist
          if (othersConfig.populateForm?.fields) {
            Object.entries(othersConfig.populateForm.fields).forEach(([key, value]) => {
              setValue(`default_${key}`, value);
            });
          }

          // Update user context and localStorage with latest Firestore data
          updateUser({
            company: {
              ...user.company,
              others: othersConfig,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error loading company settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las configuraciones.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingCompanySettings(false);
    }
  };

  // Save company settings
  const saveCompanySettings = async (config: Partial<CompanyOthersConfig>) => {
    if (!user?.company?.id) return;

    setIsSavingCompanySettings(true);
    try {
      const companyDocRef = doc(firebaseFirestore, 'companies', user.company.id);
      const companyDoc = await getDoc(companyDocRef);

      let currentOthers: CompanyOthersConfig = {
        isSourceActive: false,
        populateForm: {
          isActive: false,
          fields: {},
        },
      };

      if (companyDoc.exists()) {
        const companyData = companyDoc.data();
        currentOthers = companyData.others || currentOthers;
      }

      // Merge the new config with existing config
      const updatedOthers: CompanyOthersConfig = {
        isSourceActive: config.isSourceActive ?? currentOthers.isSourceActive,
        populateForm: {
          isActive: config.populateForm?.isActive ?? currentOthers.populateForm.isActive,
          fields: {
            ...(currentOthers.populateForm.fields || {}),
            ...(config.populateForm?.fields || {}),
          },
        },
      };

      // Save to Firestore
      await updateDoc(companyDocRef, {
        others: updatedOthers,
      });

      // Update user context and localStorage
      updateUser({
        company: {
          ...user.company,
          others: updatedOthers,
        },
      });

      return updatedOthers;
    } catch (error) {
      console.error('Error saving company settings:', error);
      throw error;
    } finally {
      setIsSavingCompanySettings(false);
    }
  };

  // Fetch form fields and company settings on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.company?.id) return;

      // Load company settings first
      await loadCompanySettings();

      // Then load form fields
      setIsLoadingFields(true);
      try {
        const q = query(
          collection(firebaseFirestore, 'forms'),
          where('company', '==', user.company.id)
        );
        const querySnapshot = await getDocs(q);
        const forms = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Form[];

        if (forms.length > 0) {
          const form = forms[0];
          setCurrentForm(form);
          setFormFields(form.fields || []);

          // Apply saved default values after form fields are loaded
          await applyDefaultValuesToForm();
        }
      } catch (error) {
        console.error('Error fetching form fields:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los campos del formulario.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoadingFields(false);
      }
    };

    fetchData();
  }, [user?.company?.id, setValue, toast]);

  const handleSourceReportsToggle = async (isChecked: boolean) => {
    try {
      await saveCompanySettings({
        isSourceActive: isChecked,
      });

      setIsSourceReportsActive(isChecked);
      toast({
        title: isChecked
          ? 'Seguimiento de fuentes habilitado'
          : 'Seguimiento de fuentes deshabilitado',
        description: `El seguimiento de fuentes en reportes ha sido ${
          isChecked ? 'habilitado' : 'deshabilitado'
        }.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAutopopulateToggle = async (isChecked: boolean) => {
    try {
      await saveCompanySettings({
        populateForm: {
          isActive: isChecked,
          fields: {}, // Keep existing fields
        },
      });

      setIsAutopopulateEnabled(isChecked);
      toast({
        title: isChecked ? 'Autocompletado habilitado' : 'Autocompletado deshabilitado',
        description: `El autocompletado del formulario de reservas ha sido ${
          isChecked ? 'habilitado' : 'deshabilitado'
        }.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const onSubmitDefaultValues = async (data: DefaultFormValues) => {
    if (!currentForm) return;

    setIsSavingDefaults(true);
    try {
      // Create the fields object for populateForm.fields
      const defaultFields: { [key: string]: string } = {};

      formFields.forEach((field) => {
        const defaultKey = `default_${field.slug}`;
        const defaultValue = data[defaultKey];

        if (defaultValue !== undefined && defaultValue !== '') {
          defaultFields[field?.slug || ''] = String(defaultValue);
        }
      });

      // Save to company collection
      const updatedConfig = await saveCompanySettings({
        populateForm: {
          isActive: isAutopopulateEnabled, // Keep current active state
          fields: defaultFields,
        },
      });

      // Update form values with the saved data to reflect current state
      if (updatedConfig?.populateForm?.fields) {
        Object.entries(updatedConfig.populateForm.fields).forEach(([key, value]) => {
          setValue(`default_${key}`, value);
        });
      }

      toast({
        title: 'Valores por defecto guardados',
        description: 'Los valores por defecto han sido configurados correctamente.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving default values:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los valores por defecto.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSavingDefaults(false);
    }
  };

  const renderFieldInput = (field: FormField) => {
    const fieldKey = `default_${field.slug}`;

    switch (field.type) {
      case FormFieldType.NUMBER:
        return (
          <NumberInput>
            <NumberInputField
              placeholder={`Valor por defecto para ${field.name.es}`}
              {...register(fieldKey, { valueAsNumber: true })}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        );

      case FormFieldType.EMAIL:
        return (
          <Input
            type='email'
            placeholder={`Valor por defecto para ${field.name.es}`}
            {...register(fieldKey)}
          />
        );

      case FormFieldType.SELECT:
        return (
          <Select placeholder='Seleccionar valor por defecto' {...register(fieldKey)}>
            {field.options?.map((option) => (
              <option key={option.id} value={option.value.es}>
                {option.value.es}
              </option>
            ))}
          </Select>
        );

      case FormFieldType.TEXT:
      default:
        return (
          <Input placeholder={`Valor por defecto para ${field.name.es}`} {...register(fieldKey)} />
        );
    }
  };

  return (
    <Flex h='100%' minH='calc(100vh - 100px)' p={6}>
      <Container maxW='container.lg'>
        <VStack spacing={6} align='stretch'>
          <Box>
            <Heading size='lg' mb={2}>
              Otras configuraciones
            </Heading>
            <Text color='gray.600' fontSize='md'>
              Configure otras configuraciones para tu sistema de reservas.
            </Text>
          </Box>

          <Card bg={bgColor} borderColor={borderColor} shadow='sm'>
            <CardHeader>
              <Heading size='md'>Configuraciones de reportes</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              {isLoadingCompanySettings && (
                <Box textAlign='center' py={4}>
                  <Spinner size='sm' />
                  <Text mt={2} fontSize='sm' color='gray.600'>
                    Cargando configuraciones...
                  </Text>
                </Box>
              )}
              <VStack spacing={4} align='stretch'>
                <FormControl display='flex' alignItems='center' justifyContent='space-between'>
                  <Box>
                    <FormLabel htmlFor='source-reports' mb={1} fontWeight='medium'>
                      Seguimiento de fuentes de reservas en reportes
                    </FormLabel>
                    <Text fontSize='sm' color='gray.600'>
                      Habilitar seguimiento de fuentes de reservas en tus reportes y analíticas
                    </Text>
                  </Box>
                  <Switch
                    id='source-reports'
                    isChecked={isSourceReportsActive}
                    onChange={(e) => handleSourceReportsToggle(e.target.checked)}
                    colorScheme='green'
                    size='lg'
                    isDisabled={isLoadingCompanySettings || isSavingCompanySettings}
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} shadow='sm'>
            <CardHeader>
              <Heading size='md'>Configuraciones del formulario de reservas</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <VStack spacing={4} align='stretch'>
                <FormControl display='flex' alignItems='center' justifyContent='space-between'>
                  <Box>
                    <FormLabel htmlFor='autopopulate-form' mb={1} fontWeight='medium'>
                      Autopopulate formulario de reservas
                    </FormLabel>
                    <Text fontSize='sm' color='gray.600'>
                      Rellenar automáticamente los campos del formulario de reserva
                    </Text>
                  </Box>
                  <Switch
                    id='autopopulate-form'
                    isChecked={isAutopopulateEnabled}
                    onChange={(e) => handleAutopopulateToggle(e.target.checked)}
                    colorScheme='green'
                    size='lg'
                    isDisabled={isLoadingCompanySettings || isSavingCompanySettings}
                  />
                </FormControl>
              </VStack>
            </CardBody>
          </Card>

          {/* Dynamic Default Values Configuration Card */}
          <Card bg={bgColor} borderColor={borderColor} shadow='sm'>
            <CardHeader>
              <Heading size='md'>Valores por defecto del formulario</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              {isLoadingFields ? (
                <Box textAlign='center' py={8}>
                  <Spinner size='lg' />
                  <Text mt={4}>Cargando campos del formulario...</Text>
                </Box>
              ) : formFields.length === 0 ? (
                <Alert status='info'>
                  <AlertIcon />
                  No hay campos configurados en el formulario. Ve a la sección "Formulario de
                  Reservas" para crear campos primero.
                </Alert>
              ) : (
                <form onSubmit={handleSubmit(onSubmitDefaultValues)}>
                  <VStack spacing={4} align='stretch'>
                    <Text fontSize='sm' color='gray.600' mb={2}>
                      Configure los valores por defecto que se usarán cuando el autocompletado esté
                      habilitado
                    </Text>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {formFields.map((field) => (
                        <FormControl key={field.slug}>
                          <FormLabel htmlFor={`default_${field.slug}`}>
                            {field.name.es}
                            {field.required && (
                              <Text as='span' color='red.500'>
                                {' '}
                                *
                              </Text>
                            )}
                          </FormLabel>
                          {renderFieldInput(field)}
                          {field.placeholder?.es && (
                            <Text fontSize='xs' color='gray.500' mt={1}>
                              Placeholder: {field.placeholder.es}
                            </Text>
                          )}
                        </FormControl>
                      ))}
                    </SimpleGrid>

                    <HStack justify='flex-end' mt={6}>
                      <Button variant='outline' onClick={() => reset()}>
                        Limpiar
                      </Button>
                      <Button
                        type='submit'
                        colorScheme='blue'
                        isLoading={isSavingDefaults}
                        loadingText='Guardando...'
                      >
                        Guardar valores por defecto
                      </Button>
                    </HStack>
                  </VStack>
                </form>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Flex>
  );
};

export default Integrations;
