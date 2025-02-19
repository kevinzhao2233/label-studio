import factory
from projects.models import Project


class ProjectFactory(factory.django.DjangoModelFactory):
    title = factory.Faker('bs')
    description = factory.Faker('paragraph')
    organization = factory.SubFactory('organizations.tests.factories.OrganizationFactory')
    created_by = factory.SelfAttribute('organization.created_by')

    class Meta:
        model = Project
