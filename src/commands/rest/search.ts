import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { Constants } from '../../constants';


// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('rest-plugin', 'search');

export default class Search extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  public static examples = [
  `$ sfdx rest:search `
  ];

  public static args = [{name: 'file'}];

  protected static flagsConfig = {
    query: flags.string(
      {
        char: 'q', description: messages.getMessage('queryFlagDescription')
      })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  public async run(): Promise<AnyJson> {
    
    const apiversion = await this.org.getConnection().retrieveMaxApiVersion();
    
    const response = await this.search(apiversion, this.flags.query);

    let searchRecords = response["searchRecords"];

    this.ux.log('Accounts:');
    const accounts = this.filter(searchRecords, 'Account');
    this.ux.table(accounts, ['Id', 'Name']);

    const optys = this.filter(searchRecords, 'Opportunity');
    this.ux.log('Opportunities:');

    this.ux.table(optys, ['Id', 'Name'])
    //this.ux.log(JSON.stringify(searchRecords, null, 3));
    return response;
  }

  private filter(data, filter) {
    return data.filter(row => row["attributes"]["type"] === filter)
  }

  private search(apiversion, query) {
    return this.org.getConnection().request({
      method: Constants.REST_METHOD_GET,
      headers: Constants.CONTENT_TYPE_APPLICATION_JSON,
      url: Constants.REST_API_ENDPOINT_PREFIX + apiversion + Constants.SEARCH_PATH + encodeURI(query)
    });
  }
}
