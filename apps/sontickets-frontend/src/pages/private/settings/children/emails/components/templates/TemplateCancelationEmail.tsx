import { Container, Img, Section, Text } from '@react-email/components';
import { FormField } from '~/core/types';

interface EmailProps {
  logoUrl: string;
  fields: FormField[];
  lang: 'es' | 'en';
  headerTitle: string;
  headerSubtitle: string;
}

const TemplateCancelationEmail = ({
  logoUrl,
  fields,
  lang,
  headerTitle,
  headerSubtitle,
}: EmailProps) => {
  return (
    <Container style={container}>
      <Section style={{ margin: '30px 0px' }}>
        <Img
          style={{
            margin: '0 auto',
          }}
          src={logoUrl}
          width='120'
          alt='Logo'
        />
      </Section>
      <Section>
        <Text style={text}>{headerTitle ?? 'Titulo de la reserva'}</Text>
        <Text style={text}>{headerSubtitle ?? 'Subtitulo de la reserva'}</Text>

        <Text style={textField}>
          Locación: <b>{`{{location}}`}</b>
        </Text>
        {fields.map((field) => {
          return (
            <Text key={field.slug} style={textField}>
              {field.name[lang]}: <b>{`{{${field.slug}}}`}</b>
            </Text>
          );
        })}
      </Section>
    </Container>
  );
};

export default TemplateCancelationEmail;

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '30px',
  margin: '0 auto',
  width: '100%',
};

const text = {
  fontSize: '14px',
  fontWeight: '300',
  color: '#404040',

  padding: '0px 16px',
};

const textField = {
  fontSize: '12px',
  fontWeight: '300',
  color: '#404040',
  margin: '0px',
  padding: '0px 16px',
};
