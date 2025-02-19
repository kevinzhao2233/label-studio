import factory
from organizations.models import Organization, OrganizationMember


class OrganizationFactory(factory.django.DjangoModelFactory):
    title = factory.Faker('company')
    created_by = factory.SubFactory('users.tests.factories.UserFactory', active_organization=None)

    class Meta:
        model = Organization

    @factory.post_generation
    def created_by_relationship(self, create, extracted, **kwargs):
        if not create or not self.created_by:
            return

        self.created_by.active_organization = self
        self.created_by.save(update_fields=['active_organization'])
        OrganizationMember.objects.create(user=self.created_by, organization=self)
