export type TCompany = {
  logoUrl: string;
  termsAndConditionUrl: string;
  name: string;
  id: string;
  externalId: string;
  type: string;
  settings: {
    reservationUpdates: {
      thanksForVisitUs: {
        active: boolean;
        html: {
          data: any;
          es: string;
          en: string;
        };
      };
    };
  };
};
