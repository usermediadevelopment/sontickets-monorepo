import { Container, Img, Link, Section, Text } from '@react-email/components';

import { FormField } from '~/core/types';

interface EmailProps {
  logoUrl: string;
  fields: FormField[];
  headerTitle: string;
  headerSubtitle: string;
  footer1: FooterProps;
  footer2: FooterProps;
  footer3: FooterProps;
  lang: 'es' | 'en';
}

export const TemplateNewReservationEmail = ({
  logoUrl,
  headerTitle,
  headerSubtitle,
  fields,
  footer1,
  footer2,
  footer3,
  lang,
}: EmailProps) => {
  return (
    <Container style={container}>
      <Section>
        <Img
          style={{
            margin: '0 auto',
          }}
          src={logoUrl}
          width='80'
          alt='Logo'
        />
      </Section>
      <Section>
        <Text style={text}>{headerTitle ?? 'Hola {name}'}</Text>
        <Text style={text}>{headerSubtitle}</Text>

        <Footer {...footer1} />
        <Text style={textField}>
          {lang == 'es' ? 'Locación' : 'Location'} <b>{`{{location}}`}</b>
        </Text>
        <Text style={textField}>
          {lang == 'es' ? 'Código' : 'Code'} <b>{`{{code}}`}</b>
        </Text>
        {fields.map((field) => {
          return (
            <Text key={field.slug} style={textField}>
              {field.name[lang]}: <b>{`{{${field.slug}}}`}</b>
            </Text>
          );
        })}

        <Footer {...footer2} />
        <Footer {...footer3} />
      </Section>
    </Container>
  );
};

type FooterProps = {
  value?: string;
  url?: string;
  urlTitle?: string;
};
const Footer = ({ value, url, urlTitle }: FooterProps) => {
  return (
    <Text style={text}>
      {value}
      {url && (
        <Link target='_blank' href={url}>
          {' ' + urlTitle}
        </Link>
      )}
    </Text>
  );
};

export default TemplateNewReservationEmail;

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
