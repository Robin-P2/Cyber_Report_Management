from django.db import models
from django.conf import settings

class Company(models.Model):
    """
    Represents a company in the system.
    """
    # Core company details
    company_name = models.CharField(max_length=255)
    standard = models.CharField(max_length=255, default='62443')
    sector = models.CharField(max_length=255, blank=True)
    region = models.CharField(max_length=255, blank=True)

    # Data field for storing structured data, replacing the old binary field
    company_data = models.JSONField(null=True, blank=True)

    # Ownership and user access control
    # A company has one primary owner.
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='owned_companies', # Use a distinct related_name
        help_text="The primary owner of the company."
    )

    # A company can have multiple users associated with it.
    users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='companies',
        blank=True,
        help_text="Users who have access to this company."
    )

    def __str__(self):
        return self.company_name

    class Meta:
        verbose_name_plural = "Companies"
        unique_together = ('owner', 'company_name')

