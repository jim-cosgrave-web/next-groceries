import React from 'react';
import { NextPageContext } from 'next';
import { myGet } from '../util/myGet';
import { env } from '../util/environment';

const apiUrl = env.apiUrl + 'securedData';

const SecuredData = ({ data }) => {
    return (
        <div>
            <h1>Get Secured Server Data</h1>
            <pre>
                {JSON.stringify(data, undefined, 2)}
            </pre>
            <br />
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut consequat, justo sit amet volutpat condimentum, nisi enim accumsan felis, quis accumsan nibh erat vel sapien. Cras quis dui semper odio volutpat dignissim. Donec facilisis augue sed elit facilisis, sit amet maximus turpis rhoncus. Donec facilisis urna quis ex porta, vitae pulvinar felis commodo. Suspendisse sodales eu augue sit amet venenatis. Duis faucibus sapien id eros pellentesque hendrerit. Proin laoreet sollicitudin ipsum a dictum.
                <br /><br />
                Integer nec malesuada lectus. Nulla faucibus in lorem eu finibus. Sed id pellentesque libero. Aliquam tincidunt, mi eu efficitur vehicula, lacus mauris condimentum ligula, vel viverra nisl turpis sit amet neque. Mauris quis sapien quam. Etiam iaculis sem id velit viverra feugiat in ac nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nullam a orci semper, mattis lectus eu, dapibus urna.
                <br /><br />
                Nulla vel turpis sollicitudin, bibendum velit eget, cursus odio. Cras gravida suscipit urna id rhoncus. Mauris laoreet urna nisi, ut venenatis velit ultrices in. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vehicula semper ex. Quisque sed convallis felis. Quisque id ultrices neque. Nunc facilisis leo et mauris mattis, vel egestas felis mollis. Aliquam erat volutpat. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Phasellus blandit lacinia mi a pretium. Nulla aliquam non velit vitae finibus.
                <br /><br />
                Nullam facilisis urna massa, eu scelerisque erat placerat non. Ut a imperdiet ipsum, ut condimentum justo. Morbi non erat mi. Aenean efficitur suscipit eros vitae malesuada. Fusce fringilla hendrerit massa sit amet vestibulum. Proin enim mi, dignissim interdum ipsum in, aliquet efficitur risus. Donec vel elit id lectus bibendum dignissim. Sed in nulla malesuada, pulvinar mauris non, convallis nibh. Nunc posuere mattis risus, nec aliquet justo posuere non. Duis nec elit in magna ornare tempor.
                <br /><br />
                Curabitur vitae sem vitae felis efficitur suscipit. Fusce varius interdum blandit. Nunc ut ante laoreet, venenatis nulla in, porttitor urna. Vestibulum iaculis magna nec nisl gravida, sed ullamcorper erat aliquet. Fusce nibh urna, fermentum ut imperdiet vel, ullamcorper sed orci. Praesent porta lectus quis porta scelerisque. Nulla quis ante vehicula, faucibus metus vel, ultrices nibh. Pellentesque at augue mattis, congue elit sed, mollis ligula. Nunc vestibulum luctus tellus non hendrerit. Vivamus in nisi eleifend, ultricies velit non, mollis dolor.
                <br /><br />
                Integer nec malesuada lectus. Nulla faucibus in lorem eu finibus. Sed id pellentesque libero. Aliquam tincidunt, mi eu efficitur vehicula, lacus mauris condimentum ligula, vel viverra nisl turpis sit amet neque. Mauris quis sapien quam. Etiam iaculis sem id velit viverra feugiat in ac nunc. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nullam a orci semper, mattis lectus eu, dapibus urna.
                <br /><br />
                Nulla vel turpis sollicitudin, bibendum velit eget, cursus odio. Cras gravida suscipit urna id rhoncus. Mauris laoreet urna nisi, ut venenatis velit ultrices in. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus vehicula semper ex. Quisque sed convallis felis. Quisque id ultrices neque. Nunc facilisis leo et mauris mattis, vel egestas felis mollis. Aliquam erat volutpat. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Phasellus blandit lacinia mi a pretium. Nulla aliquam non velit vitae finibus.
                <br /><br />
                Nullam facilisis urna massa, eu scelerisque erat placerat non. Ut a imperdiet ipsum, ut condimentum justo. Morbi non erat mi. Aenean efficitur suscipit eros vitae malesuada. Fusce fringilla hendrerit massa sit amet vestibulum. Proin enim mi, dignissim interdum ipsum in, aliquet efficitur risus. Donec vel elit id lectus bibendum dignissim. Sed in nulla malesuada, pulvinar mauris non, convallis nibh. Nunc posuere mattis risus, nec aliquet justo posuere non. Duis nec elit in magna ornare tempor.
                <br /><br />
                Curabitur vitae sem vitae felis efficitur suscipit. Fusce varius interdum blandit. Nunc ut ante laoreet, venenatis nulla in, porttitor urna. Vestibulum iaculis magna nec nisl gravida, sed ullamcorper erat aliquet. Fusce nibh urna, fermentum ut imperdiet vel, ullamcorper sed orci. Praesent porta lectus quis porta scelerisque. Nulla quis ante vehicula, faucibus metus vel, ultrices nibh. Pellentesque at augue mattis, congue elit sed, mollis ligula. Nunc vestibulum luctus tellus non hendrerit. Vivamus in nisi eleifend, ultricies velit non, mollis dolor.
            </p>
        </div>
    );
}

SecuredData.getInitialProps = async (ctx: NextPageContext) => {
    const json = await myGet(apiUrl, ctx);
    return { data: json };
}

export default SecuredData;