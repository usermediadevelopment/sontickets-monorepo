class CreatorRepository {
  get(id: string) {
    console.log("Get by id", id);
  }
}

class CreatorService {
  private repository: CreatorRepository;
  // Inject the repository in the constructor
  constructor(repo?: CreatorRepository) {
    this.repository = repo ?? new CreatorRepository();
  }

  get(id: string) {
    return this.repository.get(id);
  }
}

const service = new CreatorService();
service.get("carlos");
