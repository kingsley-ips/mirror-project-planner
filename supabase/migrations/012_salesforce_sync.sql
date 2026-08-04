-- Links a Mirror project back to the Salesforce IPS_Project__c record it
-- was created from, so the sync can tell "update this one" apart from
-- "this is new." Null for any project created by hand in Mirror directly.
alter table projects add column salesforce_id text unique;
