import { DocumentData, QueryDocumentSnapshot, SnapshotOptions } from 'firebase/firestore';
import { Schedule } from '~/core/types';
import { LocationEntity } from '../../domain/entities/location_entity';

export class LocationModel implements LocationEntity {
  id: string;
  name: string;
  company: string;
  address: string;
  schedule: Schedule;

  constructor(data: LocationEntity) {
    this.id = data.id;
    this.name = data.name;
    this.company = data.company;
    this.address = data.address;
    this.schedule = data.schedule;
  }

  static toFirestore(location: LocationEntity): DocumentData {
    return {
      id: location.id,
      name: location.name,
      company: location.company,
      address: location.address,
      schedule: location.schedule,
    };
  }

  static converter = () => {
    return {
      toFirestore: (location: LocationEntity) => this.toFirestore(location),
      fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions) => {
        const data = snapshot.data(options);
        return new LocationModel({
          id: data.id,
          name: data.name,
          company: data.company,
          address: data.address,
          schedule: data.schedule,
        });
      },
    };
  };
}
