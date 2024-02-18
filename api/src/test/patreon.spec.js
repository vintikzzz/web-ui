const assert = require('assert');
const rewire = require('rewire');
const patreon = rewire('../patreon.js');
const patreonCampaignId = 3166075;
const patreonRoles = {
  BRONZE_BACKER: 3981231,
  SILVER_BACKER: 3972747,
  GOLD_BACKER: 3981014,
  EMERALD_SPONSOR: 3981042,
  RUBY_SPONSOR: 3981061
}
const makeUser = patreon.__get__('makeUser'); 

describe('makeUser function', () => {
  it('should return user with valid patreonCampaignId and patreonRoles', () => {
    const d = {
      "data": {
        "attributes": {
          "first_name": "John",
          "last_name": "Doe",
          "email": "john.doe@example.com"
        },
        "id": "123",
        "relationships": {
          "memberships": {
            "data": [
              {
                "id": "9e3b60ce-25d4-470c-a0a1-f907b34ece89",
                "type": "member"
              }
            ]
          },
          "type": "user"
        }
      },
      "included": [
        {
          "attributes": {
            "last_charge_status": "Paid"
          },
          "id": "9e3b60ce-25d4-470c-a0a1-f907b34ece89",
          "relationships": {
            "campaign": {
              "data": {
                "id": "3166075",
                "type": "campaign"
              },
              "links": {
                "related": "https://www.patreon.com/api/oauth2/v2/campaigns/3166075"
              }
            },
            "currently_entitled_tiers": {
              "data": [
                {
                  "id": "3972747",
                  "type": "tier"
                },
                {
                  "id": "3981231",
                  "type": "tier"
                }
              ]
            }
          },
          "type": "member"
        },
        {
          "attributes": {},
          "id": "3166075",
          "type": "campaign"
        },
        {
          "attributes": {},
          "id": "3972747",
          "type": "tier"
        },
        {
          "attributes": {},
          "id": "3981231",
          "type": "tier"
        }
      ],
      "links": {
        "self": "https://www.patreon.com/api/oauth2/v2/user/123"
      }
    };

    const user = makeUser(d, patreonCampaignId, patreonRoles);
    assert.deepStrictEqual(user, {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'SILVER_BACKER',
    });
  });

});